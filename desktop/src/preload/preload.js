const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('roomiApi', {
  // Listeners from Main -> Renderer
  onSensorUpdate: (callback) => {
    const handler = (_event, data) => callback(data);
    ipcRenderer.on('sensor:update', handler);
    return () => ipcRenderer.removeListener('sensor:update', handler);
  },
  onSensorStatus: (callback) => {
    const handler = (_event, data) => callback(data);
    ipcRenderer.on('sensor:status', handler);
    return () => ipcRenderer.removeListener('sensor:status', handler);
  },
  onCharacterState: (callback) => {
    const handler = (_event, data) => callback(data);
    ipcRenderer.on('character:state', handler);
    return () => ipcRenderer.removeListener('character:state', handler);
  },
  onWalkerDirection: (callback) => {
    const handler = (_event, data) => callback(data);
    ipcRenderer.on('walker:direction', handler);
    return () => ipcRenderer.removeListener('walker:direction', handler);
  },
  onVisibilityChange: (callback) => {
    const handler = (_event, isVisible) => callback(isVisible);
    ipcRenderer.on('app:visibility', handler);
    return () => ipcRenderer.removeListener('app:visibility', handler);
  },
  onPetChange: (callback) => {
    const handler = (_event, petId) => callback(petId);
    ipcRenderer.on('character:pet', handler);
    return () => ipcRenderer.removeListener('character:pet', handler);
  },
  onSettingsChange: (callback) => {
    const handler = (_event, settings) => callback(settings);
    ipcRenderer.on('settings:change', handler);
    return () => ipcRenderer.removeListener('settings:change', handler);
  },
  onDragState: (callback) => {
    const handler = (_event, data) => callback(data);
    ipcRenderer.on('character:drag', handler);
    return () => ipcRenderer.removeListener('character:drag', handler);
  },
  onPhysicsUpdate: (callback) => {
    const handler = (_event, data) => callback(data);
    ipcRenderer.on('character:physics', handler);
    return () => ipcRenderer.removeListener('character:physics', handler);
  },
  onLand: (callback) => {
    const handler = (_event, data) => callback(data);
    ipcRenderer.on('character:land', handler);
    return () => ipcRenderer.removeListener('character:land', handler);
  },

  // Emitters from Renderer -> Main
  setHover: (isHovering) => ipcRenderer.send('hover:set', isHovering),
  interactClick: () => ipcRenderer.send('interact:click'),
  dragStart: () => ipcRenderer.send('drag:start'),
  dragMove: (delta) => ipcRenderer.send('drag:move', delta),
  dragEnd: () => ipcRenderer.send('drag:end'),
  getSettings: () => ipcRenderer.invoke('settings:get'),
  saveSettings: (settings) => ipcRenderer.invoke('settings:set', settings),
  setSimulation: (data) => ipcRenderer.send('sim:set', data)
});
