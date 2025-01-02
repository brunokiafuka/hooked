# Change Log

All notable changes to the "hooked" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [Unreleased]

## [1.0.3] - 2023-01-01

### Added
  - Support for the .jsx file extension in the file path assertion and validation utilities.
  - Inclusion of the .dist directory in .gitignore to prevent build artifacts from being tracked.

### Changed
 - Updated the error message to dynamically list all supported file extensions.

## [1.0.2] - 2023-01-01

### Fixed 
  - Displayed an appropriate error if the user has not selected an editor window when running the extension.
  - Checked the file extension of the current file before performing expensive I/O operations, such as visiting imports and analyzing the AST.

### [1.0.0] - 2023-01-01

## Added
  - Initial release of Hooked.
  - Basic functionality for analyzing hooks and generating Mermaid diagrams.