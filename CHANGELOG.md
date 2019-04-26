# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
### Added
- Crash reporter.
- Ability to downgrade.

## [0.5.1] - 2019-04-25
### Changed
- When removing a Slack instance, removes also the configurations for it.

### Fixed
- Bug fixes that made the application to crash, due too heavy refactoring.
- `Reload` button for connections is disabled when connections are being reloaded via timer.
- `Enabled`/`Disabled` radio button on modifying existing configuration was not working, due refactoring.
- Auto updater bug.
- Adding new Slack instance (authorisation) was broken, thanks `eslint`.

## [0.5.0] - 2019-04-25
### Added
- [Feat #25](https://gitlab.com/kirbo/slothy/issues/25) - One click enable/disable configuration, in `Enabled` column.
- [Docs #17](https://gitlab.com/kirbo/slothy/issues/17) - Added JSDocs.

### Fixed
- [Bug #26](https://gitlab.com/kirbo/slothy/issues/26) - No longer showing the ❌ in the `Enabled` column for SSIDs/BSSIDs which don't have confirutation yet, as it was misleading.

### Changed
- [Refactoring #14](https://gitlab.com/kirbo/slothy/issues/14) - Making application somewhat more robust and to log more useful debug data on errors.
- [Refactoring #14](https://gitlab.com/kirbo/slothy/issues/14) - (╯°□°）╯︵ ┻━┻ ("lots" of refactoring 😄 More to be done).
  ![Slightly Refactoring](https://gitlab.com/kirbo/slothy/raw/master/markdownFiles/0.5.0-refactoring.png "Slightly Refactoring")

## [0.4.0] - 2019-04-23
### Added
- New option: `Check updates at launch`.
- New option: `Launch application minimised`.
- New option: `Minimise application on quit`.
- More logging for debugging.

### Changed
- Default value for `Update Slack workspaces` set from 5 to 15 minutes.

## [0.3.8] - 2019-04-23
### Fixed
- [Bug #9](https://gitlab.com/kirbo/slothy/issues/9) - Updating the status required admin permissions.

## [0.3.7] - 2019-04-23
### Fixed
- CI/CD pipeline.

## [0.3.6] - 2019-04-23
### Fixed
- CI/CD pipeline automatically creates new tag before release.

## [0.3.5] - 2019-04-23
### Fixed
- [Bug #7](https://gitlab.com/kirbo/slothy/issues/7) - Updating the status was not working.

### Added
- CI/CD pipeline automatically creates new tag before release.

## [0.3.4] - 2019-04-23
### Fixed
- [Bug #6](https://gitlab.com/kirbo/slothy/issues/6) - Saving a configuration doesn't close the Drawer.

## [0.3.3] - 2019-04-23
### Fixed
- [Bug #5](https://gitlab.com/kirbo/slothy/issues/5) - Old `CLIENT_SECRET` on CI/CD variables.

## [0.3.2] - 2019-04-23
### Fixed
- Added missing `.env` file from CI/CD.

## [0.3.1] - 2019-04-22
### Fixed
- Auto updater was not able to quit the application on "Install and restart".

## [0.3.0] - 2019-04-22
### Added
- User can change the timer intervals.
- User can change the update configurations.

## [0.2.0] - 2019-04-22
### Added
- Electron Updater.
- Changelog.
- Enabler for user specific update download configurations (coming soon).
