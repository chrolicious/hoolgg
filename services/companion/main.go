// main.go — HoolggTracker companion app
// Watches SavedVariables/HoolggTrackerDB.lua and POSTs changes to progress-api.
//
// Usage:
//   go run ./services/companion --wow-path "C:\Program Files (x86)\World of Warcraft" --char "Name-Realm" --api-url "http://localhost:5000"
package main

import (
	"flag"
	"fmt"
	"log"
	"os"
	"path/filepath"
)

func main() {
	var (
		wowPath = flag.String("wow-path", "", "Path to the WoW installation directory (e.g. C:\\Program Files (x86)\\World of Warcraft)")
		charKey = flag.String("char", "", "Character key in AceDB format: 'Name - Realm'")
		apiURL  = flag.String("api-url", "http://localhost:5000", "Base URL of the progress-api service")
		verbose = flag.Bool("verbose", false, "Enable verbose logging")
	)
	flag.Parse()

	if *wowPath == "" {
		fmt.Fprintln(os.Stderr, "Error: --wow-path is required")
		flag.Usage()
		os.Exit(1)
	}
	if *charKey == "" {
		fmt.Fprintln(os.Stderr, "Error: --char is required (e.g. \"Name - Realm\")")
		flag.Usage()
		os.Exit(1)
	}

	savedVarsPath := filepath.Join(*wowPath, "_retail_", "WTF", "Account")
	// The actual path includes Account/ACCOUNT_NAME/SavedVariables/HoolggTrackerDB.lua
	// We watch the SavedVariables directory for any HoolggTrackerDB.lua changes.
	// For a more targeted watch, users can specify the full path.
	luaGlob := filepath.Join(savedVarsPath, "*", "SavedVariables", "HoolggTrackerDB.lua")

	log.Printf("[HoolggTracker Companion] Starting...")
	log.Printf("  WoW path  : %s", *wowPath)
	log.Printf("  Character : %s", *charKey)
	log.Printf("  API URL   : %s", *apiURL)
	log.Printf("  Watching  : %s", luaGlob)

	// Find the actual SavedVariables file
	matches, err := filepath.Glob(luaGlob)
	if err != nil || len(matches) == 0 {
		// Also try per-character SavedVariables path
		luaGlob2 := filepath.Join(*wowPath, "_retail_", "WTF", "Account", "*", "*", "*", "SavedVariables", "HoolggTrackerDB.lua")
		matches, err = filepath.Glob(luaGlob2)
		if err != nil || len(matches) == 0 {
			log.Printf("Warning: No HoolggTrackerDB.lua found at expected path. Will watch directory for creation.")
			// Watch the SavedVariables directory itself
			watchDir := filepath.Join(*wowPath, "_retail_", "WTF", "Account")
			if err := startWatcher(watchDir, *charKey, *apiURL, *verbose); err != nil {
				log.Fatalf("Watcher error: %v", err)
			}
			return
		}
	}

	// Use the first match found
	luaPath := matches[0]
	log.Printf("[HoolggTracker Companion] Found SavedVariables at: %s", luaPath)

	watchDir := filepath.Dir(luaPath)
	if err := startWatcher(watchDir, *charKey, *apiURL, *verbose); err != nil {
		log.Fatalf("Watcher error: %v", err)
	}
}
