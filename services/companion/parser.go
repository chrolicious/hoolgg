// parser.go — Lua SavedVariables table → Go struct parser
// Parses HoolggTrackerDB.lua produced by AceDB to extract task + profession state.
// Uses regex/string matching — not a full Lua parser. Handles AceDB's output format.
package main

import (
	"fmt"
	"os"
	"regexp"
	"strconv"
	"strings"
)

// HoolggTrackerData mirrors the AceDB profile schema (HT_DB.lua).
// Vault and crest data are always fetched live and not stored.
type HoolggTrackerData struct {
	CharKey     string
	Tasks       map[int]map[string]bool    // [weekNum][taskId] = done
	Professions map[string]map[int]ProfWeek // [profKey][weekNum] = state
	Show        bool
	Scale       float64
}

// ProfWeek holds the boolean state for a profession's weekly tasks.
type ProfWeek struct {
	WeeklyQuest  bool
	PatronOrders bool
	Treatise     bool
}

var (
	// Matches:  ["Key - Realm"] = {
	profileKeyRe = regexp.MustCompile(`\["([^"]+)"\]\s*=\s*\{`)

	// Matches:  ["tasks"] = {
	tableSectionRe = regexp.MustCompile(`\["(tasks|professions|show|scale)"\]\s*=\s*(.+)`)

	// Matches:  [1] = {  (week number)
	weekNumRe = regexp.MustCompile(`\[(-?\d+)\]\s*=\s*\{`)

	// Matches:  ["task_id"] = true,
	taskEntryRe = regexp.MustCompile(`\["([^"]+)"\]\s*=\s*(true|false)`)

	// Matches:  ["alchemy"] = {  (profession key)
	profKeyRe = regexp.MustCompile(`\["(alchemy|blacksmithing|enchanting|engineering|herbalism|inscription|jewelcrafting|leatherworking|mining|skinning|tailoring)"\]\s*=\s*\{`)
)

// parseHoolggTrackerDB reads and parses the Lua SavedVariables file.
// Extracts the profile for the given charKey.
func parseHoolggTrackerDB(luaPath string, charKey string) (*HoolggTrackerData, error) {
	content, err := os.ReadFile(luaPath)
	if err != nil {
		return nil, fmt.Errorf("read %s: %w", luaPath, err)
	}

	result := &HoolggTrackerData{
		CharKey:     charKey,
		Tasks:       make(map[int]map[string]bool),
		Professions: make(map[string]map[int]ProfWeek),
		Show:        true,
		Scale:       1.0,
	}

	lines := strings.Split(string(content), "\n")

	// Find the profile block for our character key
	inProfile := false
	inTasks := false
	inProfessions := false
	profileDepth := 0
	currentWeek := 0
	currentProfKey := ""
	bracketDepth := 0

	for _, rawLine := range lines {
		line := strings.TrimSpace(rawLine)
		if line == "" {
			continue
		}

		// Count bracket depth to track nesting
		opens  := strings.Count(line, "{")
		closes := strings.Count(line, "}")
		bracketDepth += opens - closes

		// Look for profile key match
		if !inProfile {
			if m := profileKeyRe.FindStringSubmatch(line); m != nil {
				if m[1] == charKey {
					inProfile = true
					profileDepth = bracketDepth
				}
			}
			continue
		}

		// Exit profile block when depth drops back
		if bracketDepth < profileDepth {
			inProfile     = false
			inTasks        = false
			inProfessions  = false
			continue
		}

		// Top-level profile sections
		if m := tableSectionRe.FindStringSubmatch(line); m != nil {
			key := m[1]
			val := strings.TrimSpace(m[2])

			switch key {
			case "show":
				result.Show = val == "true,"
			case "scale":
				val = strings.TrimRight(val, ",")
				if f, err := strconv.ParseFloat(val, 64); err == nil {
					result.Scale = f
				}
			case "tasks":
				inTasks       = true
				inProfessions = false
			case "professions":
				inProfessions = true
				inTasks       = false
			}
			continue
		}

		// ---- Tasks section parsing ----
		if inTasks {
			// Week number line
			if m := weekNumRe.FindStringSubmatch(line); m != nil {
				if week, err := strconv.Atoi(m[1]); err == nil {
					currentWeek = week
					if result.Tasks[currentWeek] == nil {
						result.Tasks[currentWeek] = make(map[string]bool)
					}
				}
				continue
			}

			// Task entry
			if m := taskEntryRe.FindStringSubmatch(line); m != nil {
				taskId := m[1]
				done   := m[2] == "true"
				if currentWeek != 0 || result.Tasks[0] != nil {
					if result.Tasks[currentWeek] == nil {
						result.Tasks[currentWeek] = make(map[string]bool)
					}
					result.Tasks[currentWeek][taskId] = done
				}
				continue
			}
		}

		// ---- Professions section parsing ----
		if inProfessions {
			// Profession key line
			if m := profKeyRe.FindStringSubmatch(line); m != nil {
				currentProfKey = m[1]
				if result.Professions[currentProfKey] == nil {
					result.Professions[currentProfKey] = make(map[int]ProfWeek)
				}
				currentWeek = 0
				continue
			}

			// Week number inside profession
			if currentProfKey != "" {
				if m := weekNumRe.FindStringSubmatch(line); m != nil {
					if week, err := strconv.Atoi(m[1]); err == nil {
						currentWeek = week
					}
					continue
				}
			}

			// Profession task entry
			if currentProfKey != "" && currentWeek != 0 {
				if m := taskEntryRe.FindStringSubmatch(line); m != nil {
					taskKey := m[1]
					done    := m[2] == "true"
					pw      := result.Professions[currentProfKey][currentWeek]
					switch taskKey {
					case "weekly_quest":
						pw.WeeklyQuest = done
					case "patron_orders":
						pw.PatronOrders = done
					case "treatise":
						pw.Treatise = done
					}
					result.Professions[currentProfKey][currentWeek] = pw
				}
			}
		}
	}

	return result, nil
}
