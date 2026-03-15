// watcher.go — fsnotify-based SavedVariables file watcher
package main

import (
	"log"
	"path/filepath"
	"strings"
	"time"

	"github.com/fsnotify/fsnotify"
)

const (
	// Debounce delay to avoid processing multiple rapid writes (WoW writes SVars in bursts)
	debounceDuration = 2 * time.Second
	luaFileName      = "HoolggTrackerDB.lua"
)

// startWatcher watches the given directory for changes to HoolggTrackerDB.lua
// and triggers parsing + sync on each write event.
func startWatcher(watchDir string, charKey string, apiURL string, verbose bool) error {
	watcher, err := fsnotify.NewWatcher()
	if err != nil {
		return err
	}
	defer watcher.Close()

	if err := watcher.Add(watchDir); err != nil {
		return err
	}

	log.Printf("[Watcher] Watching directory: %s", watchDir)
	log.Printf("[Watcher] Waiting for %s changes...", luaFileName)

	var debounceTimer *time.Timer

	for {
		select {
		case event, ok := <-watcher.Events:
			if !ok {
				return nil
			}

			// Only care about write events to our Lua file
			if event.Op&fsnotify.Write == 0 && event.Op&fsnotify.Create == 0 {
				continue
			}
			if !strings.EqualFold(filepath.Base(event.Name), luaFileName) {
				continue
			}

			if verbose {
				log.Printf("[Watcher] File event: %s op=%s", event.Name, event.Op)
			}

			// Debounce: reset timer on each event, fire after quiet period
			if debounceTimer != nil {
				debounceTimer.Stop()
			}
			capturedPath := event.Name
			debounceTimer = time.AfterFunc(debounceDuration, func() {
				log.Printf("[Watcher] Detected change in %s — parsing...", luaFileName)
				handleFileChange(capturedPath, charKey, apiURL, verbose)
			})

		case err, ok := <-watcher.Errors:
			if !ok {
				return nil
			}
			log.Printf("[Watcher] Error: %v", err)
		}
	}
}

// handleFileChange parses the Lua file and syncs the result to progress-api.
func handleFileChange(luaPath string, charKey string, apiURL string, verbose bool) {
	data, err := parseHoolggTrackerDB(luaPath, charKey)
	if err != nil {
		log.Printf("[Watcher] Parse error: %v", err)
		return
	}

	if verbose {
		log.Printf("[Watcher] Parsed %d task weeks, %d profession keys",
			len(data.Tasks), len(data.Professions))
	}

	if err := syncToAPI(data, apiURL, verbose); err != nil {
		log.Printf("[Watcher] Sync error: %v", err)
		return
	}

	log.Printf("[Watcher] Sync complete.")
}
