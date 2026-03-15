// sync.go — HTTP POST payload builder + sender to progress-api
package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"time"
)

const (
	// Endpoint to be built on progress-api
	syncEndpoint = "/users/me/characters/addon-sync"
	httpTimeout  = 15 * time.Second
)

// AddonSyncPayload is the JSON body POSTed to progress-api.
// Schema matches what the companion parser extracts from HoolggTrackerDB.lua.
type AddonSyncPayload struct {
	CharKey     string                       `json:"char_key"`      // "Name - Realm"
	Timestamp   int64                        `json:"timestamp"`     // Unix seconds
	Tasks       map[string]map[string]bool   `json:"tasks"`         // week_num_str -> task_id -> done
	Professions map[string]map[string]ProfWeekPayload `json:"professions"` // prof_key -> week_num_str -> state
}

// ProfWeekPayload is the per-week profession state sent to the API.
type ProfWeekPayload struct {
	WeeklyQuest  bool `json:"weekly_quest"`
	PatronOrders bool `json:"patron_orders"`
	Treatise     bool `json:"treatise"`
}

// syncToAPI converts parsed data into a JSON payload and POSTs it to progress-api.
func syncToAPI(data *HoolggTrackerData, apiURL string, verbose bool) error {
	// Convert int week keys to string keys for JSON (JSON object keys must be strings)
	taskPayload := make(map[string]map[string]bool, len(data.Tasks))
	for week, tasks := range data.Tasks {
		weekStr := fmt.Sprintf("%d", week)
		taskPayload[weekStr] = tasks
	}

	profPayload := make(map[string]map[string]ProfWeekPayload, len(data.Professions))
	for profKey, weekMap := range data.Professions {
		profPayload[profKey] = make(map[string]ProfWeekPayload, len(weekMap))
		for week, pw := range weekMap {
			weekStr := fmt.Sprintf("%d", week)
			profPayload[profKey][weekStr] = ProfWeekPayload{
				WeeklyQuest:  pw.WeeklyQuest,
				PatronOrders: pw.PatronOrders,
				Treatise:     pw.Treatise,
			}
		}
	}

	payload := AddonSyncPayload{
		CharKey:     data.CharKey,
		Timestamp:   time.Now().Unix(),
		Tasks:       taskPayload,
		Professions: profPayload,
	}

	body, err := json.Marshal(payload)
	if err != nil {
		return fmt.Errorf("marshal payload: %w", err)
	}

	if verbose {
		log.Printf("[Sync] POST %s%s — %d bytes", apiURL, syncEndpoint, len(body))
	}

	client := &http.Client{Timeout: httpTimeout}
	url    := apiURL + syncEndpoint

	req, err := http.NewRequest(http.MethodPost, url, bytes.NewReader(body))
	if err != nil {
		return fmt.Errorf("create request: %w", err)
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := client.Do(req)
	if err != nil {
		return fmt.Errorf("POST %s: %w", url, err)
	}
	defer resp.Body.Close()

	respBody, _ := io.ReadAll(resp.Body)

	if resp.StatusCode >= 400 {
		return fmt.Errorf("API error %d: %s", resp.StatusCode, string(respBody))
	}

	if verbose {
		log.Printf("[Sync] Response %d: %s", resp.StatusCode, string(respBody))
	}

	return nil
}
