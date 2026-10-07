# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project status

This repository is a fresh scaffold: it contains only `README.md`, `LICENSE` (MIT), and a `.gitignore`. There is no source code, `manifest.json`, `package.json`, build tooling, linter, or test suite yet. Do not assume any build/test commands exist; check the repo first and update this file once tooling is added.

## Purpose

A Chrome extension for typing Sinhala using English phonetic input (transliteration). Romanized keystrokes typed in web page inputs get converted to Sinhala Unicode script.

## Notes

- The `.gitignore` is GitHub's Visual Studio template, not a Node/web-extension one. If you add npm tooling or a build output directory, make sure `node_modules/`, `dist/`, packaged `.zip`/`.crx` files, etc. are ignored.
