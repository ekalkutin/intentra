import { describe, expect, it } from 'vitest';

import { WorkspaceCreationClosedException } from '../exceptions/index.js';

import { WorkspaceCreationSettings } from './workspace-creation-settings.js';

describe('WorkspaceCreationSettings', () => {
  it('is closed before a Platform Admin has ever turned it on', () => {
    // Act
    const settings = WorkspaceCreationSettings.closed();

    // Assert
    expect(settings.isOpen).toBe(false);
  });

  it('restores how it was saved', () => {
    // Act
    const settings = WorkspaceCreationSettings.restore({ open: true });

    // Assert
    expect(settings.isOpen).toBe(true);
  });

  it('opens and closes', () => {
    // Arrange
    const settings = WorkspaceCreationSettings.closed();

    // Act
    settings.open();
    const opened = settings.isOpen;
    settings.close();

    // Assert
    expect(opened).toBe(true);
    expect(settings.isOpen).toBe(false);
  });

  describe('ensureAllows', () => {
    it('refuses someone who is not a Platform Admin while it is closed', () => {
      // Arrange
      const settings = WorkspaceCreationSettings.closed();

      // Act
      const ensuring = () => settings.ensureAllows(false);

      // Assert
      expect(ensuring).toThrow(WorkspaceCreationClosedException);
    });

    it('lets a Platform Admin in while it is closed', () => {
      // Arrange
      const settings = WorkspaceCreationSettings.closed();

      // Act
      const ensuring = () => settings.ensureAllows(true);

      // Assert
      expect(ensuring).not.toThrow();
    });

    it('lets anyone in once it is open', () => {
      // Arrange
      const settings = WorkspaceCreationSettings.restore({ open: true });

      // Act
      const ensuring = () => settings.ensureAllows(false);

      // Assert
      expect(ensuring).not.toThrow();
    });
  });
});
