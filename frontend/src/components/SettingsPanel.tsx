import React, { memo, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================================================
// Types
// ============================================================================

interface GameSettings {
  // Audio
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
  ambientVolume: number;
  
  // Graphics
  graphicsQuality: 'low' | 'medium' | 'high' | 'ultra';
  resolution: string;
  fullscreen: boolean;
  vSync: boolean;
  
  // Gameplay
  autoSave: boolean;
  autoSaveInterval: number;
  showFPS: boolean;
  showTips: boolean;
  
  // Controls
  mouseSensitivity: number;
  keyboardLayout: 'qwerty' | 'azerty' | 'qwertz';
  
  // Accessibility
  highContrast: boolean;
  reducedMotion: boolean;
  colorBlindMode: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
}

interface SettingsPanelProps {
  settings: GameSettings;
  onSave: (settings: GameSettings) => void;
  onClose: () => void;
  isOpen: boolean;
}

// ============================================================================
// Default Settings
// ============================================================================

const DEFAULT_SETTINGS: GameSettings = {
  masterVolume: 80,
  musicVolume: 60,
  sfxVolume: 80,
  ambientVolume: 50,
  graphicsQuality: 'high',
  resolution: '1920x1080',
  fullscreen: true,
  vSync: true,
  autoSave: true,
  autoSaveInterval: 5,
  showFPS: false,
  showTips: true,
  mouseSensitivity: 50,
  keyboardLayout: 'qwerty',
  highContrast: false,
  reducedMotion: false,
  colorBlindMode: 'none',
};

const QUALITY_OPTIONS = [
  { value: 'low', label: 'Low', description: 'Best performance' },
  { value: 'medium', label: 'Medium', description: 'Balanced' },
  { value: 'high', label: 'High', description: 'Better visuals' },
  { value: 'ultra', label: 'Ultra', description: 'Best visuals' },
];

const RESOLUTION_OPTIONS = [
  '1280x720',
  '1920x1080',
  '2560x1440',
  '3840x2160',
];

const KEYBOARD_LAYOUTS = [
  { value: 'qwerty', label: 'QWERTY', description: 'Standard English' },
  { value: 'azerty', label: 'AZERTY', description: 'French layout' },
  { value: 'qwertz', label: 'QWERTZ', description: 'German layout' },
];

// ============================================================================
// SettingsPanel Component
// ============================================================================

const SettingsPanel = memo(function SettingsPanel({
  settings,
  onSave,
  onClose,
  isOpen,
}: SettingsPanelProps) {
  const [localSettings, setLocalSettings] = useState<GameSettings>(settings);
  const [activeTab, setActiveTab] = useState<'audio' | 'graphics' | 'gameplay' | 'controls' | 'accessibility'>('audio');
  const [hasChanges, setHasChanges] = useState(false);
  
  const handleChange = useCallback((key: keyof GameSettings, value: any) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  }, []);
  
  const handleSave = useCallback(() => {
    onSave(localSettings);
    setHasChanges(false);
  }, [localSettings, onSave]);
  
  const handleReset = useCallback(() => {
    setLocalSettings(DEFAULT_SETTINGS);
    setHasChanges(true);
  }, []);
  
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      if (hasChanges) {
        if (window.confirm('You have unsaved changes. Discard them?')) {
          onClose();
        }
      } else {
        onClose();
      }
    }
  }, [hasChanges, onClose]);
  
  if (!isOpen) return null;
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        onClick={hasChanges ? undefined : onClose}
        onKeyDown={handleKeyDown}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="w-full max-w-4xl max-h-[90vh] bg-slate-900 rounded-2xl border border-slate-700 shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              ⚙️ Settings
            </h1>
            
            <div className="flex items-center gap-3">
              {hasChanges && (
                <motion.span
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-sm text-yellow-400"
                >
                  Unsaved changes
                </motion.span>
              )}
              
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors"
                aria-label="Close settings"
              >
                ✕
              </motion.button>
            </div>
          </div>
          
          <div className="flex h-[calc(90vh-80px)]">
            {/* Sidebar */}
            <div className="w-64 border-r border-slate-700 p-4 space-y-1 overflow-y-auto">
              <SidebarButton
                icon="🔊"
                label="Audio"
                active={activeTab === 'audio'}
                onClick={() => setActiveTab('audio')}
              />
              <SidebarButton
                icon="🎮"
                label="Graphics"
                active={activeTab === 'graphics'}
                onClick={() => setActiveTab('graphics')}
              />
              <SidebarButton
                icon="🎯"
                label="Gameplay"
                active={activeTab === 'gameplay'}
                onClick={() => setActiveTab('gameplay')}
              />
              <SidebarButton
                icon="⌨️"
                label="Controls"
                active={activeTab === 'controls'}
                onClick={() => setActiveTab('controls')}
              />
              <SidebarButton
                icon="♿"
                label="Accessibility"
                active={activeTab === 'accessibility'}
                onClick={() => setActiveTab('accessibility')}
              />
              
              <div className="mt-8 pt-4 border-t border-slate-700">
                <SidebarButton
                  icon="🔄"
                  label="Reset to Default"
                  onClick={handleReset}
                  danger
                />
              </div>
            </div>
            
            {/* Content */}
            <div className="flex-1 p-6 overflow-y-auto">
              {activeTab === 'audio' && (
                <AudioSettings
                  settings={localSettings}
                  onChange={handleChange}
                />
              )}
              
              {activeTab === 'graphics' && (
                <GraphicsSettings
                  settings={localSettings}
                  onChange={handleChange}
                />
              )}
              
              {activeTab === 'gameplay' && (
                <GameplaySettings
                  settings={localSettings}
                  onChange={handleChange}
                />
              )}
              
              {activeTab === 'controls' && (
                <ControlsSettings
                  settings={localSettings}
                  onChange={handleChange}
                />
              )}
              
              {activeTab === 'accessibility' && (
                <AccessibilitySettings
                  settings={localSettings}
                  onChange={handleChange}
                />
              )}
            </div>
          </div>
          
          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-700 bg-slate-800/50">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleReset}
              className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
            >
              Reset to Default
            </motion.button>
            
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onClose}
                className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
              >
                Cancel
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSave}
                disabled={!hasChanges}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  hasChanges
                    ? 'bg-indigo-600 hover:bg-indigo-500 text-white'
                    : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                }`}
              >
                Save Changes
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
});

// ============================================================================
// Sub-components
// ============================================================================

function SidebarButton({
  icon,
  label,
  active,
  onClick,
  danger,
}: {
  icon: string;
  label: string;
  active?: boolean;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <motion.button
      whileHover={{ x: 4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
        active
          ? 'bg-indigo-600 text-white'
          : danger
          ? 'text-red-400 hover:bg-red-500/10'
          : 'text-slate-400 hover:bg-slate-800 hover:text-white'
      }`}
    >
      <span className="text-xl">{icon}</span>
      <span className="font-medium">{label}</span>
    </motion.button>
  );
}

function AudioSettings({
  settings,
  onChange,
}: {
  settings: GameSettings;
  onChange: (key: keyof GameSettings, value: any) => void;
}) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-white mb-4">🔊 Audio Settings</h2>
      
      <SliderSetting
        icon="🔊"
        label="Master Volume"
        value={settings.masterVolume}
        onChange={(v) => onChange('masterVolume', v)}
      />
      
      <SliderSetting
        icon="🎵"
        label="Music Volume"
        value={settings.musicVolume}
        onChange={(v) => onChange('musicVolume', v)}
      />
      
      <SliderSetting
        icon="🔔"
        label="SFX Volume"
        value={settings.sfxVolume}
        onChange={(v) => onChange('sfxVolume', v)}
      />
      
      <SliderSetting
        icon="🌿"
        label="Ambient Volume"
        value={settings.ambientVolume}
        onChange={(v) => onChange('ambientVolume', v)}
      />
    </div>
  );
}

function GraphicsSettings({
  settings,
  onChange,
}: {
  settings: GameSettings;
  onChange: (key: keyof GameSettings, value: any) => void;
}) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-white mb-4">🎮 Graphics Settings</h2>
      
      <SelectSetting
        icon="💎"
        label="Graphics Quality"
        value={settings.graphicsQuality}
        options={QUALITY_OPTIONS}
        onChange={(v) => onChange('graphicsQuality', v)}
      />
      
      <SelectSetting
        icon="📐"
        label="Resolution"
        value={settings.resolution}
        options={RESOLUTION_OPTIONS.map(v => ({ value: v, label: v }))}
        onChange={(v) => onChange('resolution', v)}
      />
      
      <ToggleSetting
        icon="🖥️"
        label="Fullscreen"
        checked={settings.fullscreen}
        onChange={(v) => onChange('fullscreen', v)}
      />
      
      <ToggleSetting
        icon="🔄"
        label="V-Sync"
        checked={settings.vSync}
        onChange={(v) => onChange('vSync', v)}
      />
    </div>
  );
}

function GameplaySettings({
  settings,
  onChange,
}: {
  settings: GameSettings;
  onChange: (key: keyof GameSettings, value: any) => void;
}) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-white mb-4">🎯 Gameplay Settings</h2>
      
      <ToggleSetting
        icon="💾"
        label="Auto Save"
        checked={settings.autoSave}
        onChange={(v) => onChange('autoSave', v)}
      />
      
      {settings.autoSave && (
        <SelectSetting
          icon="⏰"
          label="Auto Save Interval"
          value={settings.autoSaveInterval}
          options={[
            { value: 1, label: '1 minute' },
            { value: 5, label: '5 minutes' },
            { value: 10, label: '10 minutes' },
            { value: 15, label: '15 minutes' },
          ]}
          onChange={(v) => onChange('autoSaveInterval', v)}
        />
      )}
      
      <ToggleSetting
        icon="📊"
        label="Show FPS"
        checked={settings.showFPS}
        onChange={(v) => onChange('showFPS', v)}
      />
      
      <ToggleSetting
        icon="💡"
        label="Show Tips"
        checked={settings.showTips}
        onChange={(v) => onChange('showTips', v)}
      />
    </div>
  );
}

function ControlsSettings({
  settings,
  onChange,
}: {
  settings: GameSettings;
  onChange: (key: keyof GameSettings, value: any) => void;
}) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-white mb-4">⌨️ Controls Settings</h2>
      
      <SliderSetting
        icon="🖱️"
        label="Mouse Sensitivity"
        value={settings.mouseSensitivity}
        onChange={(v) => onChange('mouseSensitivity', v)}
      />
      
      <SelectSetting
        icon="⌨️"
        label="Keyboard Layout"
        value={settings.keyboardLayout}
        options={KEYBOARD_LAYOUTS}
        onChange={(v) => onChange('keyboardLayout', v)}
      />
      
      <div className="mt-8 p-4 bg-slate-800/50 rounded-lg">
        <h3 className="text-sm font-semibold text-slate-400 mb-3">⌨️ Keyboard Shortcuts</h3>
        
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-300">Place building</span>
            <kbd className="px-2 py-1 bg-slate-700 rounded text-white font-mono">Click</kbd>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-300">Rotate building</span>
            <kbd className="px-2 py-1 bg-slate-700 rounded text-white font-mono">R</kbd>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-300">Cancel placement</span>
            <kbd className="px-2 py-1 bg-slate-700 rounded text-white font-mono">Esc</kbd>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-300">Zoom in/out</span>
            <kbd className="px-2 py-1 bg-slate-700 rounded text-white font-mono">Scroll</kbd>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-300">Pan view</span>
            <kbd className="px-2 py-1 bg-slate-700 rounded text-white font-mono">Drag</kbd>
          </div>
        </div>
      </div>
    </div>
  );
}

function AccessibilitySettings({
  settings,
  onChange,
}: {
  settings: GameSettings;
  onChange: (key: keyof GameSettings, value: any) => void;
}) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-white mb-4">♿ Accessibility Settings</h2>
      
      <ToggleSetting
        icon="🔆"
        label="High Contrast Mode"
        checked={settings.highContrast}
        onChange={(v) => onChange('highContrast', v)}
      />
      
      <ToggleSetting
        icon="🎬"
        label="Reduced Motion"
        checked={settings.reducedMotion}
        onChange={(v) => onChange('reducedMotion', v)}
      />
      
      <SelectSetting
        icon="🎨"
        label="Color Blind Mode"
        value={settings.colorBlindMode}
        options={[
          { value: 'none', label: 'None' },
          { value: 'protanopia', label: 'Protanopia (Red-Blind)' },
          { value: 'deuteranopia', label: 'Deuteranopia (Green-Blind)' },
          { value: 'tritanopia', label: 'Tritanopia (Blue-Blind)' },
        ]}
        onChange={(v) => onChange('colorBlindMode', v)}
      />
    </div>
  );
}

// ============================================================================
// Helper Components
// ============================================================================

function SliderSetting({
  icon,
  label,
  value,
  onChange,
}: {
  icon: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="flex items-center gap-4">
      <span className="text-xl w-8">{icon}</span>
      
      <div className="flex-1">
        <div className="flex justify-between mb-2">
          <label className="text-slate-300">{label}</label>
          <span className="text-slate-500">{value}%</span>
        </div>
        
        <input
          type="range"
          min="0"
          max="100"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-2 bg-slate-700 rounded-full appearance-none cursor-pointer slider-thumb"
          style={{
            background: `linear-gradient(to right, #6366F1 0%, #6366F1 ${value}%, #334155 ${value}%, #334155 100%)`,
          }}
        />
      </div>
    </div>
  );
}

function ToggleSetting({
  icon,
  label,
  checked,
  onChange,
}: {
  icon: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <span className="text-xl w-8">{icon}</span>
        <span className="text-slate-300">{label}</span>
      </div>
      
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => onChange(!checked)}
        className={`relative w-12 h-6 rounded-full transition-colors ${
          checked ? 'bg-indigo-600' : 'bg-slate-700'
        }`}
      >
        <motion.div
          animate={{ x: checked ? 26 : 4 }}
          className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow"
        />
      </motion.button>
    </div>
  );
}

function SelectSetting({
  icon,
  label,
  value,
  options,
  onChange,
}: {
  icon: string;
  label: string;
  value: string | number;
  options: { value: string | number; label: string; description?: string }[];
  onChange: (value: string | number) => void;
}) {
  return (
    <div className="flex items-center gap-4">
      <span className="text-xl w-8">{icon}</span>
      
      <div className="flex-1">
        <label className="text-slate-300 block mb-2">{label}</label>
        
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

export default SettingsPanel;
export type { GameSettings, SettingsPanelProps };
