(() => {
  const APP_BRAND = 'SanityVideo © 2026';
  const DEFAULT_IMAGE_DURATION = 5;
  const DEFAULT_TEXT_DURATION = 4;
  const EXPORT_FPS = 30;
  const state = {
    layers: [],
    selectedClipId: null,
    selectedClipIds: [],
    selectedLayerId: null,
    snappingEnabled: true,
    history: [],
    historyIndex: -1,
    timelinePanActive: false,
    currentTime: 0,
    duration: 30,
    playing: false,
    lastFrameTime: 0,
    pxPerSecond: 48,
    clipEls: new Map(),
    sidebarVisible: true,
    audioContext: null,
    audioDestination: null,
    mediaSourceMap: new WeakMap(),
    exporting: false,
    exportStopRequested: false,
    scrubDrawMode: false,
    scrubDraft: null,
    sanitizing: false,
    waveformJobs: new WeakMap(),
  };

  const els = {
    app: document.getElementById('app'),
    sidebar: document.getElementById('sidebar'),
    toggleSidebarBtn: document.getElementById('toggleSidebarBtn'),
    trackList: document.getElementById('trackList'),
    tracksArea: document.getElementById('tracksArea'),
    ruler: document.getElementById('ruler'),
    playhead: document.getElementById('playhead'),
    timelineContent: document.getElementById('timelineContent'),
    timelineScroll: document.getElementById('timelineScroll'),
    previewShell: document.getElementById('previewShell'),
    previewFullscreenBtn: document.getElementById('previewFullscreenBtn'),
    uploadLayer: document.getElementById('uploadLayer'),
    mediaInput: document.getElementById('mediaInput'),
    addLayerBtn: document.getElementById('addLayerBtn'),
    duplicateLayerBtn: document.getElementById('duplicateLayerBtn'),
    deleteLayerBtn: document.getElementById('deleteLayerBtn'),
    addTextClipBtn: document.getElementById('addTextClipBtn'),
    addTransitionBtn: document.getElementById('addTransitionBtn'),
    playBtn: document.getElementById('playBtn'),
    pauseBtn: document.getElementById('pauseBtn'),
    stopBtn: document.getElementById('stopBtn'),
    fitPlayheadBtn: document.getElementById('fitPlayheadBtn'),
    splitClipBtn: document.getElementById('splitClipBtn'),
    toggleSnapBtn: document.getElementById('toggleSnapBtn'),
    undoBtn: document.getElementById('undoBtn'),
    redoBtn: document.getElementById('redoBtn'),
    saveProjectBtn: document.getElementById('saveProjectBtn'),
    loadProjectBtn: document.getElementById('loadProjectBtn'),
    loadProjectInput: document.getElementById('loadProjectInput'),
    exportBtn: document.getElementById('exportBtn'),
    clipContextMenu: null,
    clipContextMenuItems: null,
    toggleScrubDrawBtn: document.getElementById('toggleScrubDrawBtn'),
    timeDisplay: document.getElementById('timeDisplay'),
    layerSummary: document.getElementById('layerSummary'),
    statusLine: document.getElementById('statusLine'),
    canvas: document.getElementById('previewCanvas'),
    canvasPreset: document.getElementById('canvasPreset'),
    noSelection: document.getElementById('noSelection'),
    selectionPanel: document.getElementById('selectionPanel'),
    selectionSummary: document.getElementById('selectionSummary'),
    clipLabel: document.getElementById('clipLabel'),
    clipVolume: document.getElementById('clipVolume'),
    clipStart: document.getElementById('clipStart'),
    clipDuration: document.getElementById('clipDuration'),
    clipFadeType: document.getElementById('clipFadeType'),
    clipFadeDuration: document.getElementById('clipFadeDuration'),
    textClipFields: document.getElementById('textClipFields'),
    clipText: document.getElementById('clipText'),
    clipFontSize: document.getElementById('clipFontSize'),
    clipColor: document.getElementById('clipColor'),
    clipFontFamily: document.getElementById('clipFontFamily'),
    clipTextAnimation: document.getElementById('clipTextAnimation'),
    visualTransformFields: document.getElementById('visualTransformFields'),
    clipPosX: document.getElementById('clipPosX'),
    clipPosY: document.getElementById('clipPosY'),
    clipScale: document.getElementById('clipScale'),
    clipRotation: document.getElementById('clipRotation'),
    videoFxFields: document.getElementById('videoFxFields'),
    transitionFields: document.getElementById('transitionFields'),
    transitionType: document.getElementById('transitionType'),
    transitionLinkInfo: document.getElementById('transitionLinkInfo'),
    wipeFields: document.getElementById('wipeFields'),
    wipeSubtype: document.getElementById('wipeSubtype'),
    wipeColorWrap: document.getElementById('wipeColorWrap'),
    wipeColor: document.getElementById('wipeColor'),
    wipeClipWrap: document.getElementById('wipeClipWrap'),
    wipeClipId: document.getElementById('wipeClipId'),
    wipeEdgeFalloff: document.getElementById('wipeEdgeFalloff'),
    wipeAngle: document.getElementById('wipeAngle'),
    effectsFields: document.getElementById('effectsFields'),
    effectTypeSelect: document.getElementById('effectTypeSelect'),
    addEffectBtn: document.getElementById('addEffectBtn'),
    effectsList: document.getElementById('effectsList'),
    clipExposure: document.getElementById('clipExposure'),
    clipBrightness: document.getElementById('clipBrightness'),
    clipContrast: document.getElementById('clipContrast'),
    clipHue: document.getElementById('clipHue'),
    clipSpeed: document.getElementById('clipSpeed'),
    scrubFields: document.getElementById('scrubFields'),
    scrubCount: document.getElementById('scrubCount'),
    scrubMode: document.getElementById('scrubMode'),
    scrubStrength: document.getElementById('scrubStrength'),
    toggleScrubDrawBtn2: document.getElementById('toggleScrubDrawBtn2'),
    deleteScrubBtn: document.getElementById('deleteScrubBtn'),
    sanitizeMediaBtn: document.getElementById('sanitizeMediaBtn'),
    sanitizeBadge: document.getElementById('sanitizeBadge'),
    deleteClipBtn: document.getElementById('deleteClipBtn'),
    projectInstructionsSection: document.getElementById('projectInstructionsSection'),
    projectInstructionsHeader: document.getElementById('projectInstructionsHeader'),
    projectInstructionsToggle: document.getElementById('projectInstructionsToggle'),
  };
  const ctx = els.canvas.getContext('2d');

  function uid(prefix = 'id') { return prefix + '_' + Math.random().toString(36).slice(2, 10); }
  function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
  function roundToTenth(v) { return Math.round(v * 10) / 10; }
  function setStatus(msg) { els.statusLine.textContent = msg; }


  function getFullscreenElement() {
    return document.fullscreenElement || document.webkitFullscreenElement || null;
  }

  function updatePreviewFullscreenButton() {
    if (!els.previewFullscreenBtn || !els.previewShell) return;
    const active = getFullscreenElement() === els.previewShell;
    els.previewFullscreenBtn.textContent = active ? '✕ Exit Full Screen' : '⛶ Full Screen';
    els.previewFullscreenBtn.setAttribute('aria-pressed', active ? 'true' : 'false');
    els.previewFullscreenBtn.title = active ? 'Exit full screen' : 'Enter full screen';
  }

  async function togglePreviewFullscreen() {
    if (!els.previewShell) return;
    const active = getFullscreenElement() === els.previewShell;
    try {
      if (active) {
        if (document.exitFullscreen) await document.exitFullscreen();
        else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
      } else {
        if (els.previewShell.requestFullscreen) await els.previewShell.requestFullscreen();
        else if (els.previewShell.webkitRequestFullscreen) els.previewShell.webkitRequestFullscreen();
      }
    } catch (err) {
      console.error(err);
      setStatus('Full screen was blocked by the browser.');
    }
    updatePreviewFullscreenButton();
  }
  function formatTime(t) {
    const minutes = Math.floor(t / 60);
    const seconds = t % 60;
    return String(minutes).padStart(2, '0') + ':' + seconds.toFixed(1).padStart(4, '0');
  }
  function escapeHtml(str) {
    return String(str).replace(/[&<>\"]/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[s]));
  }
  function mediaKindFromType(type, fileName = '') {
    const safeType = String(type || '').toLowerCase();
    const safeName = String(fileName || '').toLowerCase();
    if (safeType.startsWith('video/')) return 'video';
    if (safeType.startsWith('audio/')) return 'audio';
    if (safeType.startsWith('image/')) return 'image';
    if (safeType.startsWith('text/') || safeName.endsWith('.txt')) return 'text';
    return null;
  }


  function isVisualClip(clip) {
    return !!clip && (clip.kind === 'video' || clip.kind === 'image' || clip.kind === 'text');
  }

  function isClipSelected(clipId) {
    return state.selectedClipIds.includes(clipId) || state.selectedClipId === clipId;
  }

  function ensureSelectedClipState() {
    if (!Array.isArray(state.selectedClipIds)) state.selectedClipIds = [];
    if (state.selectedClipId && !state.selectedClipIds.includes(state.selectedClipId)) state.selectedClipIds = [state.selectedClipId, ...state.selectedClipIds];
    state.selectedClipIds = [...new Set(state.selectedClipIds)].filter(Boolean);
    if (!state.selectedClipIds.length) state.selectedClipId = null;
    else if (!state.selectedClipIds.includes(state.selectedClipId)) state.selectedClipId = state.selectedClipIds[0];
  }

  function selectClip(clipId, layerId = null, additive = false) {
    if (!clipId) {
      state.selectedClipId = null;
    state.selectedClipIds = [];
      state.selectedClipIds = [];
      renderSelection();
      renderTracks();
      return;
    }
    if (additive) {
      ensureSelectedClipState();
      if (state.selectedClipIds.includes(clipId)) state.selectedClipIds = state.selectedClipIds.filter(id => id !== clipId);
      else state.selectedClipIds.push(clipId);
      state.selectedClipId = state.selectedClipIds[state.selectedClipIds.length - 1] || null;
    } else {
      state.selectedClipId = clipId;
      state.selectedClipIds = [clipId];
    }
    if (layerId) state.selectedLayerId = layerId;
    ensureSelectedClipState();
    renderSelection();
    renderTracks();
  }

  function getSelectedClipInfos() {
    ensureSelectedClipState();
    const ids = new Set(state.selectedClipIds);
    const out = [];
    for (const layer of state.layers) {
      for (const clip of layer.clips) {
        if (ids.has(clip.id)) out.push({ layer, clip });
      }
    }
    return out;
  }

  function hasClipSelection() {
    return getSelectedClipInfos().length > 0;
  }


  function ensureClipDefaults(clip) {
    if (!clip) return clip;
    clip.posX = Number.isFinite(Number(clip.posX)) ? Number(clip.posX) : 0;
    clip.posY = Number.isFinite(Number(clip.posY)) ? Number(clip.posY) : 0;
    clip.scale = Math.max(0.1, Number(clip.scale) || 1);
    clip.rotation = Number.isFinite(Number(clip.rotation)) ? Number(clip.rotation) : 0;
    clip.trimStart = Math.max(0, Number(clip.trimStart) || 0);
    return clip;
  }

  function createHistorySnapshot() {
    return {
      project: serializeProject(),
      selectedClipIds: [...(state.selectedClipIds || [])],
      selectedClipId: state.selectedClipId || null,
      selectedLayerId: state.selectedLayerId || null,
      currentTime: state.currentTime,
    };
  }

  async function restoreHistorySnapshot(snapshot) {
    if (!snapshot) return;
    await loadProjectFromObject(snapshot.project, { skipHistoryReset: true });
    state.selectedClipIds = Array.isArray(snapshot.selectedClipIds) ? snapshot.selectedClipIds.filter(Boolean) : [];
    state.selectedClipId = snapshot.selectedClipId || state.selectedClipIds[0] || null;
    state.selectedLayerId = snapshot.selectedLayerId || state.selectedLayerId;
    state.currentTime = Number.isFinite(Number(snapshot.currentTime)) ? Number(snapshot.currentTime) : state.currentTime;
    ensureSelectedClipState();
    renderAll();
  }

  function pushHistory(label = '') {
    const snapshot = createHistorySnapshot();
    const current = state.history[state.historyIndex];
    if (current && JSON.stringify(current) === JSON.stringify(snapshot)) return;
    state.history = state.history.slice(0, state.historyIndex + 1);
    state.history.push(snapshot);
    if (state.history.length > 120) state.history.shift();
    state.historyIndex = state.history.length - 1;
    updateUndoRedoButtons();
  }

  async function undoHistory() {
    if (state.historyIndex <= 0) return;
    state.historyIndex -= 1;
    updateUndoRedoButtons();
    await restoreHistorySnapshot(state.history[state.historyIndex]);
    setStatus('Undo applied.');
  }

  async function redoHistory() {
    if (state.historyIndex >= state.history.length - 1) return;
    state.historyIndex += 1;
    updateUndoRedoButtons();
    await restoreHistorySnapshot(state.history[state.historyIndex]);
    setStatus('Redo applied.');
  }

  function updateUndoRedoButtons() {
    if (els.undoBtn) els.undoBtn.disabled = state.historyIndex <= 0;
    if (els.redoBtn) els.redoBtn.disabled = state.historyIndex >= state.history.length - 1;
    if (els.toggleSnapBtn) els.toggleSnapBtn.textContent = `Magnet: ${state.snappingEnabled ? 'On' : 'Off'}`;
    if (els.clipContextMenu) updateClipContextMenuState();
  }

  function snapTime(value, ignoreClipId = null) {
    if (!state.snappingEnabled) return roundToTenth(value);
    const threshold = 12 / state.pxPerSecond;
    const candidates = [0];
    for (const layer of state.layers) {
      for (const clip of layer.clips) {
        if (clip.id === ignoreClipId) continue;
        candidates.push(Number(clip.start) || 0, (Number(clip.start) || 0) + (Number(clip.duration) || 0));
      }
    }
    let best = value;
    let bestDist = threshold;
    for (const candidate of candidates) {
      const dist = Math.abs(candidate - value);
      if (dist <= bestDist) {
        best = candidate;
        bestDist = dist;
      }
    }
    return roundToTenth(Math.max(0, best));
  }

  function splitSelectedClipsAtPlayhead() {
    const infos = getSelectedClipInfos().filter(({ clip }) => state.currentTime > clip.start + 0.001 && state.currentTime < clip.start + clip.duration - 0.001);
    if (!infos.length) {
      setStatus('Move the playhead inside a selected clip to split it.');
      return;
    }
    const createdIds = [];
    for (const { layer, clip } of infos) {
      ensureClipDefaults(clip);
      const cutTime = roundToTenth(state.currentTime);
      const leftDuration = roundToTenth(Math.max(0.1, cutTime - clip.start));
      const rightDuration = roundToTenth(Math.max(0.1, (clip.start + clip.duration) - cutTime));
      const rightClip = {
        ...clip,
        id: uid('clip'),
        start: cutTime,
        duration: rightDuration,
        scrubRegions: cloneScrubRegions(clip.scrubRegions),
        trimStart: Math.max(0, Number(clip.trimStart) || 0) + leftDuration * getClipPlaybackRate(clip),
      };
      clip.duration = leftDuration;
      layer.clips.push(rightClip);
      createdIds.push(rightClip.id);
    }
    state.selectedClipIds = createdIds;
    state.selectedClipId = createdIds[0] || state.selectedClipId;
    updateProjectDuration();
    renderAll();
    pushHistory('Split clips');
    setStatus('Selected clip(s) split at the playhead.');
  }

  function primeHistoryForControl(el) {
    if (!el) return;
    let timer = null;
    const scheduleCommit = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        pushHistory('Control edit');
        timer = null;
      }, 120);
    };
    el.addEventListener('input', scheduleCommit);
    el.addEventListener('change', scheduleCommit);
  }

  function getClipPlaybackRate(clip) {
    return Math.max(0.25, Number(clip?.playbackRate) || 1);
  }

  function getMaxPlayableDuration(clip) {
    if (!clip) return 0.3;
    if ((clip.kind === 'video' || clip.kind === 'audio') && clip.mediaDuration != null) {
      return Math.max(0.3, roundToTenth(Math.max(0.3, (clip.mediaDuration - (Number(clip.trimStart) || 0)) / getClipPlaybackRate(clip))));
    }
    return Math.max(0.3, Number(clip.duration) || 0.3);
  }

  function normalizeClipTiming(clip) {
    if (!clip) return;
    ensureClipDefaults(clip);
    clip.playbackRate = getClipPlaybackRate(clip);
    if (clip.kind === 'video' || clip.kind === 'audio') {
      const playableMedia = Math.max(0.3, (Number(clip.mediaDuration) || 0.3) - clip.trimStart);
      clip.duration = Math.min(Math.max(0.3, Number(clip.duration) || 0.3), roundToTenth(playableMedia / clip.playbackRate));
    } else {
      clip.duration = Math.max(0.3, Number(clip.duration) || 0.3);
    }
  }

  function getVisualFilterSettings(clip) {
    return {
      exposure: Number(clip?.exposure) || 0,
      brightness: Number.isFinite(Number(clip?.brightness)) ? Number(clip.brightness) : 100,
      contrast: Number.isFinite(Number(clip?.contrast)) ? Number(clip.contrast) : 100,
      hue: Number(clip?.hue) || 0,
    };
  }

  function getClipFadeType(clip) {
    const value = String(clip?.fadeType || 'none').toLowerCase();
    return ['none', 'in', 'out', 'inout'].includes(value) ? value : 'none';
  }

  function getClipFadeDuration(clip) {
    return Math.max(0, Number(clip?.fadeDuration) || 0);
  }

  function getClipFadeAlpha(clip, time) {
    if (!clip) return 1;
    const fadeType = getClipFadeType(clip);
    if (fadeType === 'none') return 1;
    const duration = Math.max(0, Math.min(getClipFadeDuration(clip), Math.max(0, Number(clip.duration) || 0) / 2));
    if (!duration) return 1;
    const localTime = clamp(Number(time) - Number(clip.start || 0), 0, Math.max(0, Number(clip.duration) || 0));
    let alpha = 1;
    if (fadeType === 'in' || fadeType === 'inout') alpha = Math.min(alpha, clamp(localTime / duration, 0, 1));
    if (fadeType === 'out' || fadeType === 'inout') alpha = Math.min(alpha, clamp((Number(clip.duration) - localTime) / duration, 0, 1));
    return clamp(alpha, 0, 1);
  }


  function summarizeTextClipLabel(textValue) {
    const firstLine = String(textValue || '').split(/\r?\n/).map(s => s.trim()).find(Boolean) || 'Text Clip';
    return firstLine.length > 32 ? firstLine.slice(0, 29) + '...' : firstLine;
  }

  function wrapTextLines(textValue, maxWidth) {
    const paragraphs = String(textValue || '').replace(/\r/g, '').split('\n');
    const wrapped = [];
    for (const paragraph of paragraphs) {
      const source = paragraph.trim();
      if (!source) {
        wrapped.push('');
        continue;
      }
      const words = source.split(/\s+/);
      let line = '';
      for (const word of words) {
        const candidate = line ? line + ' ' + word : word;
        if (ctx.measureText(candidate).width <= maxWidth || !line) {
          line = candidate;
        } else {
          wrapped.push(line);
          line = word;
        }
      }
      if (line) wrapped.push(line);
    }
    return wrapped.length ? wrapped : ['Text'];
  }

  function buildCanvasFilter(clip) {
    const fx = getVisualFilterSettings(clip);
    const exposureMultiplier = Math.pow(2, clamp(fx.exposure, -3, 3));
    const brightnessMultiplier = clamp(fx.brightness, 0, 200) / 100;
    const contrastMultiplier = clamp(fx.contrast, 0, 200) / 100;
    const hueDegrees = clamp(fx.hue, -180, 180);
    return `brightness(${(exposureMultiplier * brightnessMultiplier).toFixed(3)}) contrast(${contrastMultiplier.toFixed(3)}) hue-rotate(${hueDegrees}deg)`;
  }

  function defaultEffectsForClip() { return []; }

  function ensureEffectsArray(clip) {
    if (!Array.isArray(clip.effects)) clip.effects = [];
    clip.effects = clip.effects.map(effect => ({
      id: effect.id || uid('fx'),
      type: effect.type || 'blur',
      value: Number.isFinite(Number(effect.value)) ? Number(effect.value) : defaultEffectValue(effect.type || 'blur')
    }));
    return clip.effects;
  }

  function defaultEffectValue(type) {
    return ({ blur: 6, grayscale: 100, sepia: 100, saturate: 125, opacity: 100, shadow: 70 })[type] ?? 100;
  }

  function effectValueBounds(type) {
    return {
      blur: { min: 0, max: 30, step: 1, suffix: 'px' },
      grayscale: { min: 0, max: 100, step: 1, suffix: '%' },
      sepia: { min: 0, max: 100, step: 1, suffix: '%' },
      saturate: { min: 0, max: 300, step: 1, suffix: '%' },
      opacity: { min: 0, max: 100, step: 1, suffix: '%' },
      shadow: { min: 0, max: 100, step: 1, suffix: '%' },
    }[type] || { min: 0, max: 100, step: 1, suffix: '%' };
  }

  function effectAppliesToClip(effect, clip) {
    if (!clip) return false;
    if (effect.type === 'shadow') return clip.kind === 'text';
    return isVisualClip(clip);
  }

  function buildEffectsFilter(clip) {
    const pieces = [];
    for (const effect of ensureEffectsArray(clip)) {
      if (!effectAppliesToClip(effect, clip)) continue;
      if (effect.type === 'blur' && effect.value > 0) pieces.push(`blur(${effect.value}px)`);
      if (effect.type === 'grayscale' && effect.value > 0) pieces.push(`grayscale(${effect.value}%)`);
      if (effect.type === 'sepia' && effect.value > 0) pieces.push(`sepia(${effect.value}%)`);
      if (effect.type === 'saturate' && effect.value !== 100) pieces.push(`saturate(${effect.value}%)`);
    }
    return pieces.join(' ');
  }

  function getClipOpacityMultiplier(clip) {
    let opacity = 1;
    for (const effect of ensureEffectsArray(clip)) {
      if (effect.type === 'opacity' && effectAppliesToClip(effect, clip)) opacity *= clamp((Number(effect.value) || 100) / 100, 0, 1);
    }
    return clamp(opacity, 0, 1);
  }

  function getTextShadowStrength(clip) {
    for (const effect of ensureEffectsArray(clip)) {
      if (effect.type === 'shadow') return clamp((Number(effect.value) || 0) / 100, 0, 1);
    }
    return 0;
  }

  function getTextAnimState(clip, time) {
    const local = clamp(Number(time) - Number(clip.start || 0), 0, Math.max(0.001, Number(clip.duration) || 0.001));
    const progress = clamp(local / Math.max(0.001, Number(clip.duration) || 0.001), 0, 1);
    const anim = String(clip.textAnimation || 'none').toLowerCase();
    let alpha = 1;
    let translateY = 0;
    let scale = 1;
    let chars = null;
    if (anim === 'fade') alpha = clamp(progress / 0.25, 0, 1);
    if (anim === 'slideup') { alpha = clamp(progress / 0.2, 0, 1); translateY = (1 - clamp(progress / 0.25, 0, 1)) * 60; }
    if (anim === 'pop') { const p = clamp(progress / 0.22, 0, 1); alpha = p; scale = 0.6 + (0.4 * p); }
    if (anim === 'typeon') chars = Math.max(1, Math.floor((clip.text || clip.label || 'Text').length * progress));
    return { alpha, translateY, scale, chars };
  }

  function getCombinedCanvasFilter(clip) {
    return [buildCanvasFilter(clip), buildEffectsFilter(clip)].filter(Boolean).join(' ');
  }

  function findClipById(id) {
    for (const layer of state.layers) for (const clip of layer.clips) if (clip.id === id) return clip;
    return null;
  }

  function getTransitionPair(clip, layer) {
    if (!clip || clip.kind !== 'transition') return null;
    const fromClip = findClipById(clip.fromClipId) || null;
    const toClip = findClipById(clip.toClipId) || null;
    return { fromClip, toClip, layer };
  }

  function getTransitionWipeClipOptions(transitionClip) {
    if (!transitionClip) return [];
    const pair = getTransitionPair(transitionClip);
    const options = [];
    if (pair?.fromClip && isVisualClip(pair.fromClip)) options.push({ id: pair.fromClip.id, label: pair.fromClip.label || 'Source Clip' });
    if (pair?.toClip && isVisualClip(pair.toClip) && !options.some(opt => opt.id === pair.toClip.id)) options.push({ id: pair.toClip.id, label: pair.toClip.label || 'Target Clip' });
    return options;
  }

  function updateWipeInspector(clip) {
    if (!els.wipeFields) return;
    const isWipe = !!clip && clip.kind === 'transition' && String(clip.transitionType || 'crossfade') === 'wipe';
    els.wipeFields.style.display = isWipe ? 'block' : 'none';
    if (!isWipe) return;
    clip.wipeSubtype = ['color', 'clip'].includes(String(clip.wipeSubtype || '').toLowerCase()) ? String(clip.wipeSubtype).toLowerCase() : 'color';
    clip.wipeColor = clip.wipeColor || '#ffffff';
    clip.wipeEdgeFalloff = clamp(Number(clip.wipeEdgeFalloff) || 0, 0, 100);
    clip.wipeAngle = Number.isFinite(Number(clip.wipeAngle)) ? Number(clip.wipeAngle) : 0;
    const options = getTransitionWipeClipOptions(clip);
    const currentClipId = options.some(opt => opt.id === clip.wipeClipId) ? clip.wipeClipId : (options[0]?.id || '');
    clip.wipeClipId = currentClipId;
    if (els.wipeSubtype) els.wipeSubtype.value = clip.wipeSubtype;
    if (els.wipeColor) els.wipeColor.value = clip.wipeColor;
    if (els.wipeEdgeFalloff) els.wipeEdgeFalloff.value = String(Math.round(clip.wipeEdgeFalloff));
    if (els.wipeAngle) els.wipeAngle.value = String(Math.round(clip.wipeAngle));
    if (els.wipeClipId) {
      els.wipeClipId.innerHTML = options.map(opt => `<option value="${escapeHtml(opt.id)}">${escapeHtml(opt.label)}</option>`).join('') || '<option value=>No linked clip</option>';
      els.wipeClipId.value = currentClipId;
    }
    if (els.wipeColorWrap) els.wipeColorWrap.style.display = clip.wipeSubtype === 'color' ? '' : 'none';
    if (els.wipeClipWrap) els.wipeClipWrap.style.display = clip.wipeSubtype === 'clip' ? '' : 'none';
  }

  async function generateWaveformForClip(clip) {
    if (!clip || clip.kind !== 'audio' || clip.waveformDataUrl || !clip.src || state.waveformJobs.get(clip)) return;
    const job = (async () => {
      try {
        const response = await fetch(clip.src);
        const arrayBuffer = await response.arrayBuffer();
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;
        const ac = state.audioContext || new AudioCtx();
        const buffer = await ac.decodeAudioData(arrayBuffer.slice(0));
        const channel = buffer.getChannelData(0);
        const bars = 96;
        const step = Math.max(1, Math.floor(channel.length / bars));
        const peaks = [];
        for (let i = 0; i < bars; i++) {
          let peak = 0;
          const start = i * step;
          const end = Math.min(channel.length, start + step);
          for (let s = start; s < end; s++) peak = Math.max(peak, Math.abs(channel[s] || 0));
          peaks.push(peak);
        }
        const canv = document.createElement('canvas');
        canv.width = 384; canv.height = 48;
        const c2 = canv.getContext('2d');
        c2.clearRect(0,0,canv.width,canv.height);
        c2.fillStyle = 'rgba(255,255,255,0.88)';
        const mid = canv.height / 2;
        const barW = canv.width / peaks.length;
        peaks.forEach((peak, i) => {
          const h = Math.max(2, peak * (canv.height * 0.9));
          const x = i * barW + 0.5;
          c2.fillRect(x, mid - h/2, Math.max(1, barW - 1), h);
        });
        clip.waveformDataUrl = canv.toDataURL('image/png');
        renderTracks();
      } catch (err) { console.warn('Waveform generation skipped', err); }
      finally { state.waveformJobs.delete(clip); }
    })();
    state.waveformJobs.set(clip, job);
    return job;
  }


  function cloneScrubRegions(list) {
    return Array.isArray(list) ? list.map(r => ({
      x: Number(r.x) || 0, y: Number(r.y) || 0, w: Number(r.w) || 0.2, h: Number(r.h) || 0.2,
      mode: r.mode || 'pixelate', strength: Number(r.strength) || 14
    })) : [];
  }

  function clipHasSanitizedMedia(clip) {
    return !!clip?.sanitized;
  }

  function extensionForMime(mimeType, fallback = 'webm') {
    const clean = String(mimeType || '').toLowerCase();
    if (clean.includes('png')) return 'png';
    if (clean.includes('jpeg') || clean.includes('jpg')) return 'jpg';
    if (clean.includes('webp')) return 'webp';
    if (clean.includes('webm')) return 'webm';
    return fallback;
  }

  async function sanitizeImageClip(clip) {
    const source = clip.element;
    if (!source) throw new Error('Missing image source');
    const sw = source.naturalWidth || source.width;
    const sh = source.naturalHeight || source.height;
    const off = document.createElement('canvas');
    off.width = sw;
    off.height = sh;
    const octx = off.getContext('2d');
    octx.drawImage(source, 0, 0, sw, sh);
    const blob = await new Promise((resolve, reject) => off.toBlob(b => b ? resolve(b) : reject(new Error('Image sanitize failed')), 'image/png'));
    const url = URL.createObjectURL(blob);
    const media = await createMediaElement('image', url);
    clip.src = url;
    clip.element = media;
    clip.mimeType = 'image/png';
    clip.fileName = (clip.fileName || clip.label || 'image').replace(/\.[^.]+$/, '') + '_sanitized.png';
    clip.label = clip.fileName;
    clip.sanitized = true;
  }

  async function sanitizeVideoClip(clip) {
    const source = clip.element;
    if (!(source instanceof HTMLVideoElement)) throw new Error('Missing video source');
    const mimeType = combinedExportMime();
    if (!mimeType) throw new Error('No WebM recorder available in this browser');
    const off = document.createElement('canvas');
    off.width = Math.max(2, source.videoWidth || 1280);
    off.height = Math.max(2, source.videoHeight || 720);
    const octx = off.getContext('2d');

    const canvasStream = off.captureStream(EXPORT_FPS);
    let audioTracks = [];
    try {
      const sourceStream = source.captureStream ? source.captureStream() : (source.mozCaptureStream ? source.mozCaptureStream() : null);
      if (sourceStream) audioTracks = sourceStream.getAudioTracks();
    } catch (err) {}

    const stream = new MediaStream([...canvasStream.getVideoTracks(), ...audioTracks]);
    const recorder = new MediaRecorder(stream, { mimeType });
    const chunks = [];
    recorder.ondataavailable = (e) => { if (e.data && e.data.size) chunks.push(e.data); };

    const done = new Promise((resolve, reject) => {
      recorder.onerror = (e) => reject(e.error || new Error('Video sanitize failed'));
      recorder.onstop = () => resolve();
    });

    const originalMuted = source.muted;
    const originalLoop = source.loop;
    const originalTime = source.currentTime || 0;
    source.muted = true;
    source.loop = false;
    try { source.pause(); } catch (err) {}
    try { source.currentTime = 0; } catch (err) {}

    recorder.start(250);
    await source.play();
    await new Promise((resolve) => {
      let raf = 0;
      const draw = () => {
        if (source.ended || source.paused) {
          recorder.stop();
          resolve();
          return;
        }
        octx.clearRect(0, 0, off.width, off.height);
        octx.drawImage(source, 0, 0, off.width, off.height);
        raf = requestAnimationFrame(draw);
      };
      draw();
      source.addEventListener('ended', () => cancelAnimationFrame(raf), { once: true });
    });
    await done;
    try { source.pause(); } catch (err) {}
    source.muted = originalMuted;
    source.loop = originalLoop;
    try { source.currentTime = originalTime; } catch (err) {}

    const blob = new Blob(chunks, { type: mimeType });
    const url = URL.createObjectURL(blob);
    const media = await createMediaElement('video', url);
    await ensureAudioGraphFor(media);
    clip.src = url;
    clip.element = media;
    clip.mimeType = mimeType;
    clip.fileName = (clip.fileName || clip.label || 'video').replace(/\.[^.]+$/, '') + '_sanitized.' + extensionForMime(mimeType, 'webm');
    clip.label = clip.fileName;
    clip.mediaDuration = roundToTenth(media.duration || clip.duration || 1);
    clip.duration = Math.min(clip.duration, clip.mediaDuration);
    clip.sanitized = true;
  }

  async function sanitizeSelectedMedia() {
    const info = getSelectedClipInfo();
    if (!info) return;
    const { clip } = info;
    if (!(clip.kind === 'image' || clip.kind === 'video')) {
      alert('Select an image or video clip first. Audio metadata scrubbing in-browser is a swamp of codec nonsense.');
      return;
    }
    if (state.sanitizing) return;
    state.sanitizing = true;
    if (els.sanitizeMediaBtn) els.sanitizeMediaBtn.disabled = true;
    try {
      setStatus('Scrubbing embedded file data from selected media...');
      if (clip.kind === 'image') await sanitizeImageClip(clip);
      else await sanitizeVideoClip(clip);
      renderSelection();
      renderTracks();
      drawPreview();
      pushHistory('Sanitize media');
      setStatus('Created sanitized local copy of selected media.');
    } catch (err) {
      console.error(err);
      alert('Sanitize failed. Some browsers get cranky about local media re-recording.');
      setStatus('Sanitize failed.');
    } finally {
      state.sanitizing = false;
      if (els.sanitizeMediaBtn) els.sanitizeMediaBtn.disabled = false;
    }
  }

  function selectedClipSupportsScrub() {
    const info = getSelectedClipInfo();
    return !!(info && (info.clip.kind === 'image' || info.clip.kind === 'video'));
  }

  function toggleScrubDrawMode(force = null) {
    const next = force == null ? !state.scrubDrawMode : !!force;
    if (next && !selectedClipSupportsScrub()) {
      alert('Select an image or video clip first. The scrub brush cannot paint onto raw audio or pure metaphysics.');
      return;
    }
    state.scrubDrawMode = next;
    state.scrubDraft = null;
    const active = state.scrubDrawMode;
    if (els.toggleScrubDrawBtn) els.toggleScrubDrawBtn.textContent = active ? 'Finish Scrub Draw' : 'Add Scrub Box';
    if (els.toggleScrubDrawBtn2) els.toggleScrubDrawBtn2.textContent = active ? 'Finish Draw' : 'Draw Region';
    setStatus(active ? 'Draw a scrub box on the preview canvas.' : 'Scrub draw mode off.');
    drawPreview();
  }

  function getCanvasNormalizedPos(evt) {
    const rect = els.canvas.getBoundingClientRect();
    return {
      x: clamp((evt.clientX - rect.left) / rect.width, 0, 1),
      y: clamp((evt.clientY - rect.top) / rect.height, 0, 1),
    };
  }

  function drawPixelatedRegion(sx, sy, sw, sh, strength) {
    const off = document.createElement('canvas');
    const ow = Math.max(4, Math.round(sw / Math.max(2, strength)));
    const oh = Math.max(4, Math.round(sh / Math.max(2, strength)));
    off.width = ow; off.height = oh;
    const octx = off.getContext('2d');
    octx.imageSmoothingEnabled = false;
    octx.drawImage(els.canvas, sx, sy, sw, sh, 0, 0, ow, oh);
    ctx.save();
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(off, 0, 0, ow, oh, sx, sy, sw, sh);
    ctx.restore();
  }

  function drawBlurRegion(sx, sy, sw, sh, strength) {
    const off = document.createElement('canvas');
    off.width = Math.max(8, Math.round(sw));
    off.height = Math.max(8, Math.round(sh));
    const octx = off.getContext('2d');
    octx.filter = `blur(${Math.max(2, strength * 0.8)}px)`;
    octx.drawImage(els.canvas, sx, sy, sw, sh, 0, 0, off.width, off.height);
    ctx.drawImage(off, sx, sy, sw, sh);
  }

  function drawScrubRegions(clip) {
    const regions = clip.scrubRegions || [];
    const width = els.canvas.width;
    const height = els.canvas.height;
    for (const region of regions) {
      const sx = clamp(region.x, 0, 1) * width;
      const sy = clamp(region.y, 0, 1) * height;
      const sw = clamp(region.w, 0.005, 1) * width;
      const sh = clamp(region.h, 0.005, 1) * height;
      const mode = region.mode || 'pixelate';
      const strength = Number(region.strength) || 14;
      if (mode === 'black') {
        ctx.save();
        ctx.fillStyle = '#000';
        ctx.fillRect(sx, sy, sw, sh);
        ctx.restore();
      } else if (mode === 'blur') {
        drawBlurRegion(sx, sy, sw, sh, strength);
      } else {
        drawPixelatedRegion(sx, sy, sw, sh, strength);
      }
      ctx.save();
      ctx.strokeStyle = 'rgba(255,255,255,0.55)';
      ctx.lineWidth = 1;
      ctx.strokeRect(sx + 0.5, sy + 0.5, sw - 1, sh - 1);
      ctx.restore();
    }
  }

  function drawScrubDraft() {
    if (!state.scrubDraft) return;
    const width = els.canvas.width;
    const height = els.canvas.height;
    const sx = state.scrubDraft.x * width;
    const sy = state.scrubDraft.y * height;
    const sw = state.scrubDraft.w * width;
    const sh = state.scrubDraft.h * height;
    ctx.save();
    ctx.setLineDash([8, 6]);
    ctx.strokeStyle = 'rgba(255,255,255,0.9)';
    ctx.lineWidth = 2;
    ctx.strokeRect(sx, sy, sw, sh);
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    ctx.fillRect(sx, sy, sw, sh);
    ctx.restore();
  }

  function ensureClipContextMenu() {
    if (els.clipContextMenu) return els.clipContextMenu;
    const menu = document.createElement('div');
    menu.id = 'clipContextMenu';
    menu.className = 'clip-context-menu';
    menu.innerHTML = `
      <button type="button" data-action="undo">Undo</button>
      <button type="button" data-action="redo">Redo</button>
      <button type="button" data-action="split" data-requires-clip="true">Split At Playhead</button>
      <button type="button" data-action="magnet">Magnet: On</button>
      <button type="button" data-action="fit">Fit Timeline</button>
      <button type="button" data-action="delete" data-requires-clip="true">Delete Selected Clip(s)</button>
    `;
    document.body.appendChild(menu);
    els.clipContextMenu = menu;
    els.clipContextMenuItems = {
      undo: menu.querySelector('[data-action="undo"]'),
      redo: menu.querySelector('[data-action="redo"]'),
      split: menu.querySelector('[data-action="split"]'),
      magnet: menu.querySelector('[data-action="magnet"]'),
      fit: menu.querySelector('[data-action="fit"]'),
      delete: menu.querySelector('[data-action="delete"]'),
    };
    menu.addEventListener('mousedown', (e) => e.stopPropagation());
    menu.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-action]');
      if (!btn || btn.disabled) return;
      const action = btn.dataset.action;
      closeClipContextMenu();
      if (action === 'undo') undoHistory();
      else if (action === 'redo') redoHistory();
      else if (action === 'split') splitSelectedClipsAtPlayhead();
      else if (action === 'magnet') {
        state.snappingEnabled = !state.snappingEnabled;
        updateUndoRedoButtons();
        pushHistory('Toggle snapping');
      } else if (action === 'fit') fitTimelineView();
      else if (action === 'delete') deleteSelectedClips();
    });
    const closeOnPointer = (e) => {
      if (!els.clipContextMenu || !els.clipContextMenu.classList.contains('open')) return;
      if (!els.clipContextMenu.contains(e.target)) closeClipContextMenu();
    };
    window.addEventListener('mousedown', closeOnPointer);
    window.addEventListener('blur', closeClipContextMenu);
    window.addEventListener('resize', closeClipContextMenu);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeClipContextMenu(); });
    return menu;
  }

  function updateClipContextMenuState() {
    const menu = ensureClipContextMenu();
    const items = els.clipContextMenuItems;
    if (!menu || !items) return;
    const clipSelected = hasClipSelection();
    items.undo.disabled = state.historyIndex <= 0;
    items.redo.disabled = state.historyIndex >= state.history.length - 1;
    items.split.disabled = !clipSelected;
    items.delete.disabled = !clipSelected;
    items.split.classList.toggle('muted', items.split.disabled);
    items.delete.classList.toggle('muted', items.delete.disabled);
    items.undo.classList.toggle('muted', items.undo.disabled);
    items.redo.classList.toggle('muted', items.redo.disabled);
    items.magnet.disabled = false;
    items.fit.disabled = false;
    items.magnet.classList.remove('muted');
    items.fit.classList.remove('muted');
    items.magnet.textContent = `Magnet: ${state.snappingEnabled ? 'On' : 'Off'}`;
  }

  function closeClipContextMenu() {
    if (!els.clipContextMenu) return;
    els.clipContextMenu.classList.remove('open');
    els.clipContextMenu.style.left = '-9999px';
    els.clipContextMenu.style.top = '-9999px';
  }

  function openClipContextMenu(clientX, clientY) {
    const menu = ensureClipContextMenu();
    updateClipContextMenuState();
    menu.classList.add('open');
    menu.style.left = '0px';
    menu.style.top = '0px';
    const rect = menu.getBoundingClientRect();
    const left = Math.max(8, Math.min(clientX, window.innerWidth - rect.width - 8));
    const top = Math.max(8, Math.min(clientY, window.innerHeight - rect.height - 8));
    menu.style.left = left + 'px';
    menu.style.top = top + 'px';
  }

  function fitTimelineView() {
    const available = Math.max(320, els.timelineScroll.clientWidth - 120);
    const nextPx = clamp(Math.floor(available / Math.max(1, state.duration)), 2, 220);
    state.pxPerSecond = nextPx;
    document.documentElement.style.setProperty('--timeline-unit', state.pxPerSecond + 'px');
    renderAll();
    const totalWidth = state.duration * state.pxPerSecond;
    els.timelineScroll.scrollLeft = Math.max(0, (totalWidth - els.timelineScroll.clientWidth) / 2);
  }

  function createLayer(name, forcedId = null) {
    const layer = { id: forcedId || uid('layer'), name, visible: true, clips: [] };
    state.layers.push(layer);
    if (!state.selectedLayerId) state.selectedLayerId = layer.id;
    renderAll();
    return layer;
  }
  function getLayerById(id) { return state.layers.find(l => l.id === id); }
  function selectLayer(id) {
    if (getLayerById(id)) {
      state.selectedLayerId = id;
      if (els.uploadLayer) els.uploadLayer.value = id;
      renderTracks();
      updateUploadLayerSelect();
    }
  }
  function getSelectedClipInfo() {
    ensureSelectedClipState();
    for (const layer of state.layers) {
      const clip = layer.clips.find(c => c.id === state.selectedClipId || (state.selectedClipIds || []).includes(c.id));
      if (clip) return { layer, clip };
    }
    return null;
  }

  function updateProjectDuration() {
    let maxEnd = 30;
    for (const layer of state.layers) {
      for (const clip of layer.clips) {
        normalizeClipTiming(clip);
        maxEnd = Math.max(maxEnd, clip.start + clip.duration + 1);
      }
    }
    state.duration = Math.max(5, Math.ceil(maxEnd));
    const width = Math.max(1200, Math.ceil(state.duration * state.pxPerSecond) + 200);
    els.timelineContent.style.width = width + 'px';
  }

  function renderRuler() {
    els.ruler.innerHTML = '';
    const total = Math.ceil(state.duration);
    for (let s = 0; s <= total; s++) {
      const tick = document.createElement('div');
      tick.className = 'ruler-tick';
      tick.style.left = (s * state.pxPerSecond) + 'px';
      tick.textContent = s + 's';
      els.ruler.appendChild(tick);
    }
  }

  function renderTracks() {
    state.clipEls.clear();
    els.trackList.innerHTML = '';
    els.tracksArea.innerHTML = '';
    els.tracksArea.style.height = (state.layers.length * 68) + 'px';

    state.layers.forEach((layer, index) => {
      const row = document.createElement('div');
      row.className = 'track-row' + (layer.id === state.selectedLayerId ? ' selected' : '');
      row.innerHTML = `
        <div class="track-info">
          <div class="track-title">${escapeHtml(layer.name)}</div>
          <div class="track-sub">${layer.clips.length} clip${layer.clips.length === 1 ? '' : 's'}</div>
        </div>
      `;
      row.addEventListener('click', () => selectLayer(layer.id));
      row.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        selectLayer(layer.id);
        openClipContextMenu(e.clientX, e.clientY);
      });

      const actions = document.createElement('div');
      actions.className = 'track-actions';

      const rename = document.createElement('div');
      rename.className = 'rename-btn';
      rename.title = 'Rename layer';
      rename.textContent = '✎';
      rename.addEventListener('click', (e) => {
        e.stopPropagation();
        const nextName = prompt('Rename layer:', layer.name);
        if (!nextName) return;
        const clean = nextName.trim();
        if (!clean) return;
        layer.name = clean;
        renderAll();
        pushHistory('Rename layer');
      });

      const vis = document.createElement('div');
      vis.className = 'vis-toggle ' + (layer.visible ? '' : 'off');
      vis.title = layer.visible ? 'Layer visible' : 'Layer hidden';
      vis.textContent = layer.visible ? '👁' : '🚫';
      vis.addEventListener('click', (e) => {
        e.stopPropagation();
        layer.visible = !layer.visible;
        renderAll();
        pushHistory('Toggle layer visibility');
      });
      const dup = document.createElement('div');
      dup.className = 'tiny-btn';
      dup.title = 'Duplicate layer';
      dup.textContent = '⧉';
      dup.addEventListener('click', async (e) => {
        e.stopPropagation();
        selectLayer(layer.id);
        await duplicateSelectedLayer();
        pushHistory('Duplicate layer');
      });
      const del = document.createElement('div');
      del.className = 'tiny-btn';
      del.title = 'Delete layer';
      del.textContent = '🗑';
      del.addEventListener('click', (e) => {
        e.stopPropagation();
        selectLayer(layer.id);
        deleteSelectedLayer();
        pushHistory('Delete layer');
      });
      actions.append(rename, vis, dup, del);
      row.appendChild(actions);
      els.trackList.appendChild(row);

      layer.clips.forEach(clip => {
        const clipEl = document.createElement('div');
        clipEl.className = 'clip' + (clip.id === state.selectedClipId ? ' selected' : '') + (isClipSelected(clip.id) && clip.id !== state.selectedClipId ? ' multi-selected' : '') + (clip.kind === 'transition' ? ' transition-clip' : '');
        clipEl.dataset.kind = clip.kind;
        clipEl.style.left = (clip.start * state.pxPerSecond) + 'px';
        clipEl.style.top = (index * 68 + 7) + 'px';
        clipEl.style.width = Math.max(24, clip.duration * state.pxPerSecond) + 'px';
        const transitionMeta = clip.kind === 'transition' ? `<div class="transition-badge">${escapeHtml(String(clip.transitionType || 'crossfade'))}</div>` : '';
        const waveform = clip.kind === 'audio' && clip.waveformDataUrl ? `<div class="waveform-strip" style="background-image:url('${clip.waveformDataUrl}')"></div>` : '';
        clipEl.innerHTML = `
          <div class="clip-inner">
            <div class="handle left"></div>
            <div class="clip-body">
              <div class="clip-title">${escapeHtml(clip.label)}</div>
              <div class="clip-meta">${clip.kind} • ${clip.duration.toFixed(1)}s</div>
              ${transitionMeta}
              ${waveform}
            </div>
            <div class="handle right"></div>
          </div>
        `;
        if (clip.kind === 'audio' && !clip.waveformDataUrl) generateWaveformForClip(clip);
        attachClipInteractions(clipEl, layer, clip, index);
        els.tracksArea.appendChild(clipEl);
        state.clipEls.set(clip.id, clipEl);
      });
    });
    updateLayerSummary();
  }

  function updateLayerSummary() {
    els.layerSummary.innerHTML = '';
    state.layers.forEach((layer, idx) => {
      const div = document.createElement('div');
      div.textContent = `${idx + 1}. ${layer.name} — ${layer.visible ? 'visible' : 'hidden'} — ${layer.clips.length} clip${layer.clips.length === 1 ? '' : 's'}`;
      els.layerSummary.appendChild(div);
    });
  }

  function attachClipInteractions(clipEl, layer, clip, layerIndex) {
    const leftHandle = clipEl.querySelector('.left');
    const rightHandle = clipEl.querySelector('.right');
    const body = clipEl.querySelector('.clip-body');

    clipEl.addEventListener('mousedown', (e) => {
      if (e.button !== 0) return;
      e.stopPropagation();
      selectClip(clip.id, layer.id, e.shiftKey);
    });
    clipEl.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (!isClipSelected(clip.id)) selectClip(clip.id, layer.id, false);
      else if (layer?.id) selectLayer(layer.id);
      openClipContextMenu(e.clientX, e.clientY);
    });

    body.addEventListener('mousedown', (e) => {
      e.stopPropagation();
      if (e.button !== 0) return;
      if (!e.shiftKey && !isClipSelected(clip.id)) selectClip(clip.id, layer.id, false);
      else selectClip(clip.id, layer.id, e.shiftKey);
      const selectedInfos = getSelectedClipInfos();
      if (!selectedInfos.length) return;
      const startX = e.clientX;
      const startY = e.clientY;
      const bases = selectedInfos.map(({ layer, clip }) => ({ clip, start: clip.start, layerIndex: state.layers.indexOf(layer) }));
      const anchorLayerIndex = bases[0].layerIndex;
      const onMove = (ev) => {
        const dx = ev.clientX - startX;
        const dy = ev.clientY - startY;
        const deltaTime = dx / state.pxPerSecond;
        const layerShift = clamp(Math.floor((anchorLayerIndex * 68 + dy) / 68), 0, state.layers.length - 1) - anchorLayerIndex;
        for (const base of bases) {
          base.clip.start = snapTime(Math.max(0, base.start + deltaTime), base.clip.id);
          const desiredLayerIndex = clamp(base.layerIndex + layerShift, 0, state.layers.length - 1);
          const currentLayer = state.layers.find(l => l.clips.includes(base.clip));
          const nextLayer = state.layers[desiredLayerIndex];
          if (currentLayer !== nextLayer) {
            const oldIndex = currentLayer.clips.indexOf(base.clip);
            if (oldIndex >= 0) currentLayer.clips.splice(oldIndex, 1);
            nextLayer.clips.push(base.clip);
          }
        }
        state.selectedLayerId = state.layers[clamp(anchorLayerIndex + layerShift, 0, state.layers.length - 1)].id;
        updateProjectDuration();
        renderTracks();
        renderSelection();
      };
      const onUp = () => {
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onUp);
        pushHistory('Move clips');
      };
      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
    });

    leftHandle.addEventListener('mousedown', (e) => {
      if (e.button !== 0) return;
      e.stopPropagation();
      selectClip(clip.id, layer.id, e.shiftKey);
      const selectedInfos = getSelectedClipInfos();
      if (!selectedInfos.length) return;
      const startX = e.clientX;
      const bases = selectedInfos.map(({ clip }) => ({ clip, start: clip.start, duration: clip.duration, trimStart: Number(clip.trimStart) || 0 }));
      const onMove = (ev) => {
        const delta = roundToTenth((ev.clientX - startX) / state.pxPerSecond);
        for (const base of bases) {
          let newStart = snapTime(Math.max(0, base.start + delta), base.clip.id);
          const shift = newStart - base.start;
          base.clip.start = roundToTenth(newStart);
          base.clip.duration = roundToTenth(Math.max(0.3, base.duration - shift));
          if (base.clip.kind === 'video' || base.clip.kind === 'audio') base.clip.trimStart = Math.max(0, base.trimStart + shift * getClipPlaybackRate(base.clip));
          normalizeClipTiming(base.clip);
        }
        updateProjectDuration();
        renderTracks();
        renderSelection();
      };
      const onUp = () => {
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onUp);
        pushHistory('Trim clip start');
      };
      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
    });

    rightHandle.addEventListener('mousedown', (e) => {
      if (e.button !== 0) return;
      e.stopPropagation();
      selectClip(clip.id, layer.id, e.shiftKey);
      const selectedInfos = getSelectedClipInfos();
      if (!selectedInfos.length) return;
      const startX = e.clientX;
      const bases = selectedInfos.map(({ clip }) => ({ clip, duration: clip.duration }));
      const onMove = (ev) => {
        const delta = roundToTenth((ev.clientX - startX) / state.pxPerSecond);
        for (const base of bases) {
          base.clip.duration = roundToTenth(Math.max(0.3, base.duration + delta));
          normalizeClipTiming(base.clip);
        }
        updateProjectDuration();
        renderTracks();
        renderSelection();
      };
      const onUp = () => {
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onUp);
        pushHistory('Trim clip end');
      };
      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
    });
  }

  function renderSelection() {
    const infos = getSelectedClipInfos();
    const info = getSelectedClipInfo();
    if (!info || !infos.length) {
      els.noSelection.style.display = 'block';
      els.selectionPanel.style.display = 'none';
      return;
    }
    const { clip } = info;
    const multiple = infos.length > 1;
    els.noSelection.style.display = 'none';
    els.selectionPanel.style.display = 'block';
    els.selectionSummary.textContent = multiple ? `${infos.length} clips selected. Shared edits apply to all selected clips when supported.` : `1 clip selected: ${clip.label}`;
    els.clipLabel.disabled = multiple;
    els.clipText.disabled = multiple;
    els.clipLabel.value = clip.label;
    els.clipVolume.value = clip.volume ?? 1;
    els.clipStart.value = clip.start;
    els.clipDuration.value = clip.duration;
    els.clipVolume.disabled = multiple || !(clip.kind === 'audio' || clip.kind === 'video');
    els.clipFadeType.value = getClipFadeType(clip);
    els.clipFadeDuration.value = getClipFadeDuration(clip).toFixed(1).replace(/\.0$/, '');
    const allText = infos.every(({ clip }) => clip.kind === 'text');
    const allVideo = infos.every(({ clip }) => clip.kind === 'video');
    const allVisual = infos.every(({ clip }) => isVisualClip(clip));
    const allTransition = infos.every(({ clip }) => clip.kind === 'transition');
    const allScrubbable = infos.every(({ clip }) => clip.kind === 'image' || clip.kind === 'video');
    const effectsCapable = infos.every(({ clip }) => isVisualClip(clip));
    els.textClipFields.style.display = allText ? 'block' : 'none';
    els.videoFxFields.style.display = allVideo ? 'block' : 'none';
    els.visualTransformFields.style.display = allVisual ? 'block' : 'none';
    els.transitionFields.style.display = allTransition ? 'block' : 'none';
    els.effectsFields.style.display = effectsCapable ? 'block' : 'none';
    els.scrubFields.style.display = allScrubbable && infos.length === 1 ? 'block' : 'none';
    if (allScrubbable && infos.length === 1) {
      clip.scrubRegions = cloneScrubRegions(clip.scrubRegions);
      const last = clip.scrubRegions[clip.scrubRegions.length - 1] || { mode: 'pixelate', strength: 14 };
      els.scrubCount.textContent = `${clip.scrubRegions.length} region${clip.scrubRegions.length === 1 ? '' : 's'}`;
      els.scrubMode.value = last.mode || 'pixelate';
      els.scrubStrength.value = Number(last.strength) || 14;
      if (els.sanitizeMediaBtn) els.sanitizeMediaBtn.style.display = 'inline-flex';
      els.sanitizeBadge.style.display = clipHasSanitizedMedia(clip) ? 'inline-flex' : 'none';
    } else {
      if (els.sanitizeMediaBtn) els.sanitizeMediaBtn.style.display = 'none';
      els.sanitizeBadge.style.display = 'none';
    }
    if (allText) {
      els.clipText.value = clip.text || '';
      els.clipFontSize.value = clip.fontSize || 48;
      els.clipColor.value = clip.color || '#ffffff';
      els.clipFontFamily.value = clip.fontFamily || 'Arial';
      els.clipTextAnimation.value = clip.textAnimation || 'none';
    }
    if (allVideo) {
      const fx = getVisualFilterSettings(clip);
      els.clipExposure.value = fx.exposure;
      els.clipBrightness.value = fx.brightness;
      els.clipContrast.value = fx.contrast;
      els.clipHue.value = fx.hue;
      els.clipSpeed.value = getClipPlaybackRate(clip);
    }
    if (allVisual) {
      ensureClipDefaults(clip);
      els.clipPosX.value = Math.round((clip.posX || 0) * 100);
      els.clipPosY.value = Math.round((clip.posY || 0) * 100);
      els.clipScale.value = Math.round((clip.scale || 1) * 100);
      els.clipRotation.value = Math.round(clip.rotation || 0);
    }
    if (allTransition) {
      els.transitionType.value = clip.transitionType || 'crossfade';
      const pair = getTransitionPair(clip, info.layer);
      els.transitionLinkInfo.value = pair ? `${pair.fromClip?.label || 'Prev'} -> ${pair.toClip?.label || 'Next'}` : 'Transition links missing';
      updateWipeInspector(clip);
    } else if (els.wipeFields) {
      els.wipeFields.style.display = 'none';
    }
    if (effectsCapable) renderEffectsList(clip, infos);
  }


  function renderEffectsList(clip, infos = null) {
    if (!els.effectsList) return;
    const selectedInfos = infos || getSelectedClipInfos();
    const host = els.effectsList;
    host.innerHTML = '';
    const sourceEffects = ensureEffectsArray(clip);
    if (!sourceEffects.length) {
      host.innerHTML = '<div class="effect-stack-empty">No effects on the selected clip stack yet.</div>';
      return;
    }
    sourceEffects.forEach((effect, index) => {
      const bounds = effectValueBounds(effect.type);
      const card = document.createElement('div');
      card.className = 'effect-card';
      card.innerHTML = `
        <div class="effect-card-head">
          <strong>${escapeHtml(effect.type)}</strong>
          <button type="button" data-remove-effect="${effect.id}">Remove</button>
        </div>
        <label class="small">Amount</label>
        <input type="range" min="${bounds.min}" max="${bounds.max}" step="${bounds.step}" value="${effect.value}" data-effect-input="${effect.id}" />
        <div class="small" data-effect-readout="${effect.id}">${effect.value}${bounds.suffix}</div>
      `;
      host.appendChild(card);
    });
    host.querySelectorAll('[data-effect-input]').forEach(input => {
      let effectHistoryTimer = null;
      const commitEffectHistory = () => {
        clearTimeout(effectHistoryTimer);
        effectHistoryTimer = setTimeout(() => {
          pushHistory('Edit effect');
          effectHistoryTimer = null;
        }, 120);
      };
      input.addEventListener('input', () => {
        const id = input.getAttribute('data-effect-input');
        const value = Number(input.value);
        applyToSelectedClips((targetClip) => {
          const effect = ensureEffectsArray(targetClip).find(e => e.id === id) || ensureEffectsArray(targetClip)[indexOfEffectByType(targetClip, id)];
          if (effect) effect.value = value;
        }, targetClip => ensureEffectsArray(targetClip).some(e => e.id === id || e.type === (sourceEffects.find(e => e.id === id)?.type)));
        const effectType = sourceEffects.find(e => e.id === id)?.type || 'blur';
        const bounds = effectValueBounds(effectType);
        const readout = host.querySelector(`[data-effect-readout="${id}"]`);
        if (readout) readout.textContent = `${value}${bounds.suffix}`;
        drawPreview();
        commitEffectHistory();
      });
      input.addEventListener('change', commitEffectHistory);
    });
    host.querySelectorAll('[data-remove-effect]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-remove-effect');
        applyToSelectedClips((targetClip) => {
          targetClip.effects = ensureEffectsArray(targetClip).filter(e => e.id !== id && e.type !== (sourceEffects.find(se => se.id === id)?.type));
        }, targetClip => ensureEffectsArray(targetClip).some(e => e.id === id || e.type === (sourceEffects.find(se => se.id === id)?.type)));
        renderSelection();
        drawPreview();
        pushHistory('Remove effect');
      });
    });
  }

  function indexOfEffectByType(clip, effectId) {
    const type = ensureEffectsArray(clip).find(e => e.id === effectId)?.type;
    return ensureEffectsArray(clip).findIndex(e => e.type === type);
  }

  async function ensureAudioGraphFor(media) {
    if (!(media instanceof HTMLMediaElement)) return;
    if (!state.audioContext) {
      state.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      state.audioDestination = state.audioContext.createMediaStreamDestination();
    }
    if (state.audioContext.state === 'suspended') {
      try { await state.audioContext.resume(); } catch (err) {}
    }
    if (state.mediaSourceMap.has(media)) return;
    const source = state.audioContext.createMediaElementSource(media);
    source.connect(state.audioContext.destination);
    source.connect(state.audioDestination);
    state.mediaSourceMap.set(media, source);
  }

  async function prepareAudioGraph() {
    for (const layer of state.layers) {
      for (const clip of layer.clips) {
        if (clip.element instanceof HTMLMediaElement) await ensureAudioGraphFor(clip.element);
      }
    }
  }

  function syncAudioVideo() {
    for (const layer of state.layers) {
      for (const clip of layer.clips) {
        const media = clip.element;
        if (!(media instanceof HTMLMediaElement)) continue;
        const playbackRate = getClipPlaybackRate(clip);
        const active = state.currentTime >= clip.start && state.currentTime <= clip.start + clip.duration && state.playing;
        media.volume = (clip.volume ?? 1) * getClipFadeAlpha(clip, state.currentTime);
        try { media.playbackRate = playbackRate; } catch (err) {}
        if (active) {
          const desired = clamp((Number(clip.trimStart) || 0) + (state.currentTime - clip.start) * playbackRate, 0, Math.max(0, (clip.mediaDuration ?? clip.duration) - 0.03));
          if (Math.abs((media.currentTime || 0) - desired) > 0.25) {
            try { media.currentTime = desired; } catch (err) {}
          }
          if (media.paused) media.play().catch(() => {});
        } else {
          if (!media.paused) media.pause();
        }
      }
    }
  }

  function drawMediaFit(source, width, height, clip = null) {
    const sw = source.videoWidth || source.naturalWidth || source.width;
    const sh = source.videoHeight || source.naturalHeight || source.height;
    if (!sw || !sh) return;
    const fitScale = Math.min(width / sw, height / sh);
    const baseDw = sw * fitScale;
    const baseDh = sh * fitScale;
    const c = ensureClipDefaults(clip || {});
    const clipScale = Math.max(0.1, Number(c.scale) || 1);
    const dw = baseDw * clipScale;
    const dh = baseDh * clipScale;
    const cx = width / 2 + (Number(c.posX) || 0) * width;
    const cy = height / 2 + (Number(c.posY) || 0) * height;
    ctx.save();
    if (clip) ctx.globalAlpha *= getClipFadeAlpha(clip, state.currentTime) * getClipOpacityMultiplier(clip);
    if (clip && (clip.kind === 'video' || clip.kind === 'image')) ctx.filter = getCombinedCanvasFilter(clip);
    ctx.translate(cx, cy);
    ctx.rotate((Number(c.rotation) || 0) * Math.PI / 180);
    ctx.drawImage(source, -dw / 2, -dh / 2, dw, dh);
    ctx.restore();
  }


  function renderVisualClip(clip, width, height, overrideAlpha = 1) {
    if (!clip) return;
    if (clip.kind === 'image' || clip.kind === 'video') {
      ctx.save();
      ctx.globalAlpha *= overrideAlpha;
      drawMediaFit(clip.element, width, height, clip);
      ctx.restore();
      if (clip.scrubRegions?.length) drawScrubRegions(clip);
    } else if (clip.kind === 'text') {
      const fontSize = Math.max(12, Number(clip.fontSize) || 48);
      const c = ensureClipDefaults(clip);
      const anim = getTextAnimState(clip, state.currentTime);
      ctx.save();
      ctx.globalAlpha = overrideAlpha * getClipFadeAlpha(clip, state.currentTime) * getClipOpacityMultiplier(clip) * anim.alpha;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.filter = buildEffectsFilter(clip);
      ctx.font = `700 ${fontSize}px ${clip.fontFamily || 'Arial'}`;
      ctx.fillStyle = clip.color || '#ffffff';
      const shadow = getTextShadowStrength(clip);
      ctx.strokeStyle = `rgba(0,0,0,${0.85 * Math.max(0.25, shadow || 1)})`;
      ctx.lineJoin = 'round';
      ctx.lineWidth = Math.max(2, Math.floor(fontSize * 0.08));
      ctx.shadowColor = `rgba(0,0,0,${0.45 * shadow})`;
      ctx.shadowBlur = 18 * shadow;
      const clipScale = Math.max(0.1, Number(c.scale) || 1) * anim.scale;
      ctx.translate(width / 2 + (Number(c.posX) || 0) * width, height * 0.82 + (Number(c.posY) || 0) * height - anim.translateY);
      ctx.rotate((Number(c.rotation) || 0) * Math.PI / 180);
      ctx.scale(clipScale, clipScale);
      const maxWidth = width * 0.84;
      const sourceText = clip.text || clip.label || 'Text';
      const animatedText = anim.chars == null ? sourceText : sourceText.slice(0, anim.chars);
      const lines = wrapTextLines(animatedText, maxWidth);
      const lineHeight = Math.round(fontSize * 1.15);
      const startY = -((lines.length - 1) * lineHeight / 2);
      for (let i = 0; i < lines.length; i++) {
        const y = startY + i * lineHeight;
        ctx.strokeText(lines[i], 0, y, maxWidth);
        ctx.fillText(lines[i], 0, y, maxWidth);
      }
      ctx.restore();
    }
  }

  function drawPreview() {
    const { width, height } = els.canvas;
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, width, height);
    for (const layer of state.layers) {
      if (!layer.visible) continue;
      for (const clip of layer.clips) {
        const active = state.currentTime >= clip.start && state.currentTime <= clip.start + clip.duration;
        if (!active) continue;
        if (clip.kind === 'transition') continue;
        renderVisualClip(clip, width, height, 1);
      }
      for (const clip of layer.clips) {
        const active = state.currentTime >= clip.start && state.currentTime <= clip.start + clip.duration;
        if (!active || clip.kind !== 'transition') continue;
        const pair = getTransitionPair(clip, layer);
        if (!pair || !pair.fromClip || !pair.toClip) continue;
        const progress = clamp((state.currentTime - clip.start) / Math.max(0.001, clip.duration), 0, 1);
        const type = String(clip.transitionType || 'crossfade');
        if (type === 'dipblack') {
          const blackAmount = progress < 0.5 ? progress * 2 : (1 - progress) * 2;
          renderVisualClip(progress < 0.5 ? pair.fromClip : pair.toClip, width, height, 1);
          ctx.save();
          ctx.globalAlpha = clamp(blackAmount, 0, 1);
          ctx.fillStyle = '#000';
          ctx.fillRect(0,0,width,height);
          ctx.restore();
        } else if (type === 'wipe') {
          const angle = ((Number(clip.wipeAngle) || 0) * Math.PI) / 180;
          const nx = Math.cos(angle);
          const ny = Math.sin(angle);
          const corners = [
            (0 * nx) + (0 * ny),
            (width * nx) + (0 * ny),
            (0 * nx) + (height * ny),
            (width * nx) + (height * ny),
          ];
          const minProj = Math.min(...corners);
          const maxProj = Math.max(...corners);
          const edgeProj = minProj + ((maxProj - minProj) * progress);
          const falloffPx = ((Number(clip.wipeEdgeFalloff) || 0) / 100) * Math.max(width, height) * 0.35;
          renderVisualClip(pair.fromClip, width, height, 1);
          if (String(clip.wipeSubtype || 'color') === 'clip') {
            const wipeClip = findClipById(clip.wipeClipId) || pair.toClip;
            const gradientStart = edgeProj - falloffPx;
            const gradientEnd = edgeProj + Math.max(1, falloffPx);
            const gx0 = (width / 2) + (nx * gradientStart);
            const gy0 = (height / 2) + (ny * gradientStart);
            const gx1 = (width / 2) + (nx * gradientEnd);
            const gy1 = (height / 2) + (ny * gradientEnd);
            ctx.save();
            const grad = ctx.createLinearGradient(gx0, gy0, gx1, gy1);
            grad.addColorStop(0, 'rgba(255,255,255,1)');
            grad.addColorStop(1, 'rgba(255,255,255,0)');
            ctx.globalCompositeOperation = 'source-over';
            renderVisualClip(wipeClip, width, height, 1);
            ctx.globalCompositeOperation = 'destination-in';
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, width, height);
            ctx.restore();
          } else {
            ctx.save();
            if (falloffPx > 0.001) {
              const gradientStart = edgeProj - falloffPx;
              const gradientEnd = edgeProj + Math.max(1, falloffPx);
              const gx0 = (width / 2) + (nx * gradientStart);
              const gy0 = (height / 2) + (ny * gradientStart);
              const gx1 = (width / 2) + (nx * gradientEnd);
              const gy1 = (height / 2) + (ny * gradientEnd);
              const grad = ctx.createLinearGradient(gx0, gy0, gx1, gy1);
              grad.addColorStop(0, clip.wipeColor || '#ffffff');
              grad.addColorStop(1, 'rgba(0,0,0,0)');
              ctx.fillStyle = grad;
            } else {
              ctx.fillStyle = clip.wipeColor || '#ffffff';
            }
            ctx.fillRect(0, 0, width, height);
            ctx.restore();
          }
          ctx.save();
          ctx.beginPath();
          const side = Math.max(width, height) * 3;
          const tx = width / 2;
          const ty = height / 2;
          const tangentX = -ny;
          const tangentY = nx;
          const p1x = tx + tangentX * side + nx * side + nx * edgeProj;
          const p1y = ty + tangentY * side + ny * side + ny * edgeProj;
          const p2x = tx - tangentX * side + nx * side + nx * edgeProj;
          const p2y = ty - tangentY * side + ny * side + ny * edgeProj;
          const p3x = tx - tangentX * side - nx * side + nx * edgeProj;
          const p3y = ty - tangentY * side - ny * side + ny * edgeProj;
          const p4x = tx + tangentX * side - nx * side + nx * edgeProj;
          const p4y = ty + tangentY * side - ny * side + ny * edgeProj;
          ctx.moveTo(p1x, p1y);
          ctx.lineTo(p2x, p2y);
          ctx.lineTo(p3x, p3y);
          ctx.lineTo(p4x, p4y);
          ctx.closePath();
          ctx.clip();
          renderVisualClip(pair.toClip, width, height, 1);
          ctx.restore();
        } else {
          renderVisualClip(pair.fromClip, width, height, 1 - progress);
          renderVisualClip(pair.toClip, width, height, progress);
        }
      }
    }
    if (state.scrubDrawMode) drawScrubDraft();
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.font = '14px Arial';
    ctx.fillText(formatTime(state.currentTime), 12, height - 14);
  }

  function renderPlayhead() {
    els.playhead.style.left = (state.currentTime * state.pxPerSecond) + 'px';
    els.timeDisplay.textContent = `${formatTime(state.currentTime)} / ${formatTime(state.duration)}`;
  }

  function frame(now) {
    if (!state.lastFrameTime) state.lastFrameTime = now;
    const dt = (now - state.lastFrameTime) / 1000;
    state.lastFrameTime = now;
    if (state.playing) {
      state.currentTime += dt;
      if (state.currentTime > state.duration) {
        state.currentTime = state.duration;
        state.playing = false;
        syncAudioVideo();
      }
    }
    syncAudioVideo();
    drawPreview();
    renderPlayhead();
    requestAnimationFrame(frame);
  }

  function renderAll() {
    updateProjectDuration();
    renderRuler();
    renderTracks();
    renderSelection();
    renderPlayhead();
    updateUploadLayerSelect();
    drawPreview();
  }

  function updateUploadLayerSelect() {
    const current = state.selectedLayerId || els.uploadLayer.value;
    els.uploadLayer.innerHTML = '';
    state.layers.forEach(layer => {
      const opt = document.createElement('option');
      opt.value = layer.id;
      opt.textContent = layer.name;
      els.uploadLayer.appendChild(opt);
    });
    if (state.layers.some(l => l.id === current)) els.uploadLayer.value = current;
    else if (state.layers[0]) els.uploadLayer.value = state.layers[0].id;
  }

  function findNextStart(layer) {
    let maxEnd = 0;
    for (const c of layer.clips) maxEnd = Math.max(maxEnd, c.start + c.duration + 0.2);
    return roundToTenth(maxEnd);
  }

  function getImportStartTime(layer, offset = 0) {
    return roundToTenth(Math.max(0, state.currentTime + offset));
  }

  function buildBaseClip(kind, label, start, duration, mediaDuration) {
    return {
      id: uid('clip'),
      kind,
      label,
      start: roundToTenth(Math.max(0, start)),
      duration: roundToTenth(Math.max(0.3, duration)),
      mediaDuration: roundToTenth(Math.max(0.3, mediaDuration)),
      element: null,
      volume: 1,
      src: '',
      mimeType: '',
      fileName: label || kind,
      scrubRegions: [],
      exposure: 0,
      brightness: 100,
      contrast: 100,
      hue: 0,
      playbackRate: 1,
      fadeType: 'none',
      fadeDuration: 0.5,
      posX: 0,
      posY: 0,
      scale: 1,
      rotation: 0,
      trimStart: 0,
      fontFamily: kind === 'text' ? 'Arial' : '',
      textAnimation: 'none',
      effects: [],
      waveformDataUrl: '',
      transitionType: 'crossfade',
      fromClipId: '',
      toClipId: '',
      wipeSubtype: 'color',
      wipeColor: '#ffffff',
      wipeClipId: '',
      wipeEdgeFalloff: 0,
      wipeAngle: 0
    };
  }


  function createTextClip(targetLayerId) {
    const layer = getLayerById(targetLayerId) || state.layers[0];
    if (!layer) return;
    const clip = buildBaseClip('text', 'Your text here', getImportStartTime(layer), DEFAULT_TEXT_DURATION, DEFAULT_TEXT_DURATION);
    clip.text = 'Your text here';
    clip.fontSize = 48;
    clip.color = '#ffffff';
    clip.fontFamily = 'Arial';
    clip.mimeType = 'text/plain';
    clip.fileName = 'text';
    layer.clips.push(clip);
    state.selectedLayerId = layer.id;
    state.selectedClipId = clip.id;
    state.selectedClipIds = [clip.id];
    renderAll();
    setStatus('Text clip added.');
  }

  async function createTextClipFromFile(file, layer, start) {
    const clip = buildBaseClip('text', file.name || 'text', start, DEFAULT_TEXT_DURATION, DEFAULT_TEXT_DURATION);
    clip.text = await file.text();
    clip.label = file.name || 'Text Clip';
    clip.fontSize = 48;
    clip.color = '#ffffff';
    clip.fontFamily = 'Arial';
    clip.mimeType = file.type || 'text/plain';
    clip.fileName = file.name || 'text.txt';
    return clip;
  }


  function createTransitionClip() {
    const infos = getSelectedClipInfos().filter(({ clip }) => isVisualClip(clip));
    if (infos.length !== 2) {
      alert('Select exactly two visual clips first, then add a transition clip between them.');
      return;
    }
    const sorted = infos.slice().sort((a, b) => a.clip.start - b.clip.start);
    const fromInfo = sorted[0];
    const toInfo = sorted[1];
    const duration = clamp(roundToTenth(Math.min(1, fromInfo.clip.duration / 2, toInfo.clip.duration / 2)), 0.2, 5);
    const clip = {
      id: uid('clip'),
      kind: 'transition',
      label: 'Transition',
      start: roundToTenth(Math.max(fromInfo.clip.start, toInfo.clip.start - duration)),
      duration,
      mediaDuration: duration,
      volume: 1,
      text: '',
      fontSize: 48,
      color: '#ffffff',
      fontFamily: 'Arial',
      textAnimation: 'none',
      exposure: 0,
      brightness: 100,
      contrast: 100,
      hue: 0,
      playbackRate: 1,
      fadeType: 'none',
      fadeDuration: 0,
      posX: 0,
      posY: 0,
      scale: 1,
      rotation: 0,
      trimStart: 0,
      src: '', mimeType: '', fileName: 'transition', scrubRegions: [], effects: [], waveformDataUrl: '',
      transitionType: 'crossfade',
      fromClipId: fromInfo.clip.id,
      toClipId: toInfo.clip.id,
      wipeSubtype: 'color',
      wipeColor: '#ffffff',
      wipeClipId: toInfo.clip.id,
      wipeEdgeFalloff: 0,
      wipeAngle: 0,
      element: null,
    };
    const targetLayer = fromInfo.layer;
    targetLayer.clips.push(clip);
    state.selectedLayerId = targetLayer.id;
    state.selectedClipId = clip.id;
    state.selectedClipIds = [clip.id];
    renderAll();
    setStatus('Transition clip added.');
  }

  function createMediaElement(kind, url) {
    return new Promise((resolve, reject) => {
      if (kind === 'image') {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = url;
      } else if (kind === 'video') {
        const video = document.createElement('video');
        video.preload = 'auto';
        video.crossOrigin = 'anonymous';
        video.src = url;
        video.addEventListener('loadedmetadata', () => resolve(video), { once: true });
        video.addEventListener('error', reject, { once: true });
      } else if (kind === 'audio') {
        const audio = document.createElement('audio');
        audio.preload = 'auto';
        audio.src = url;
        audio.addEventListener('loadedmetadata', () => resolve(audio), { once: true });
        audio.addEventListener('error', reject, { once: true });
      }
    });
  }

  async function addMediaFiles(files, targetLayerId) {
    const layer = getLayerById(targetLayerId) || state.layers[0];
    if (!layer) return;
    let timelineOffset = 0;
    for (const file of files) {
      const kind = mediaKindFromType(file.type || '', file.name || '');
      if (!kind) continue;
      const start = getImportStartTime(layer, timelineOffset);
      let clip = null;
      if (kind === 'text') {
        clip = await createTextClipFromFile(file, layer, start);
      } else {
        const url = URL.createObjectURL(file);
        const media = await createMediaElement(kind, url);
        if (media instanceof HTMLMediaElement) await ensureAudioGraphFor(media);
        const mediaDuration = (kind === 'video' || kind === 'audio') ? (media.duration || 1) : DEFAULT_IMAGE_DURATION;
        clip = buildBaseClip(kind, file.name, start, kind === 'image' ? DEFAULT_IMAGE_DURATION : Math.max(0.3, mediaDuration), mediaDuration);
        clip.element = media;
        clip.src = url;
        clip.sourceFile = file;
        clip.mimeType = file.type || '';
        clip.fileName = file.name;
      }
      layer.clips.push(clip);
      state.selectedLayerId = layer.id;
      state.selectedClipId = clip.id;
      state.selectedClipIds = [clip.id];
      timelineOffset = roundToTenth((clip.start + clip.duration + 0.2) - state.currentTime);
    }
    renderAll();
  }

  async function duplicateClip(clip) {
    let media = null;
    if (clip.kind !== 'text' && clip.kind !== 'transition') {
      media = await createMediaElement(clip.kind, clip.src);
      if (media instanceof HTMLMediaElement) await ensureAudioGraphFor(media);
    }
    return {
      ...clip,
      id: uid('clip'),
      label: clip.label + ' Copy',
      element: media,
      sourceFile: clip.sourceFile || null,
      start: roundToTenth(clip.start + 0.2),
      scrubRegions: cloneScrubRegions(clip.scrubRegions),
      effects: JSON.parse(JSON.stringify(ensureEffectsArray(clip))),
      fontFamily: clip.fontFamily || 'Arial',
      textAnimation: clip.textAnimation || 'none',
      waveformDataUrl: clip.waveformDataUrl || '',
      transitionType: clip.transitionType || 'crossfade',
      fromClipId: clip.fromClipId || '',
      toClipId: clip.toClipId || '',
      wipeSubtype: clip.wipeSubtype || 'color',
      wipeColor: clip.wipeColor || '#ffffff',
      wipeClipId: clip.wipeClipId || '',
      wipeEdgeFalloff: clamp(Number(clip.wipeEdgeFalloff) || 0, 0, 100),
      wipeAngle: Number.isFinite(Number(clip.wipeAngle)) ? Number(clip.wipeAngle) : 0,
    };
  }

  async function duplicateSelectedLayer() {
    const source = getLayerById(state.selectedLayerId);
    if (!source) return;
    const newLayer = { id: uid('layer'), name: source.name + ' Copy', visible: source.visible, clips: [] };
    for (const clip of source.clips) newLayer.clips.push(await duplicateClip(clip));
    const insertAt = state.layers.indexOf(source) + 1;
    state.layers.splice(insertAt, 0, newLayer);
    state.selectedLayerId = newLayer.id;
    renderAll();
  }

  function deleteSelectedLayer() {
    if (state.layers.length <= 1) {
      alert('Need at least one layer. The timeline goblin requires a floor to stand on.');
      return;
    }
    const idx = state.layers.findIndex(l => l.id === state.selectedLayerId);
    if (idx < 0) return;
    const removed = state.layers.splice(idx, 1)[0];
    if (removed) {
      state.selectedClipIds = (state.selectedClipIds || []).filter(id => !removed.clips.some(c => c.id === id));
      if (state.selectedClipId && removed.clips.some(c => c.id === state.selectedClipId)) state.selectedClipId = state.selectedClipIds[0] || null;
    }
    state.selectedLayerId = state.layers[Math.max(0, idx - 1)]?.id || state.layers[0]?.id || null;
    renderAll();
  }

  function getTimelineLocalXFromClientX(clientX) {
    const rect = els.timelineScroll.getBoundingClientRect();
    return clamp(clientX - rect.left, 0, rect.width);
  }

  function getTimelineContentXFromClientX(clientX) {
    return els.timelineScroll.scrollLeft + getTimelineLocalXFromClientX(clientX);
  }

  function setCurrentTimeFromClientX(clientX) {
    const contentX = getTimelineContentXFromClientX(clientX);
    state.currentTime = clamp(contentX / state.pxPerSecond, 0, state.duration);
    drawPreview();
    renderPlayhead();
  }

  function setZoomAtClientX(nextPxPerSecond, clientX) {
    const oldPx = state.pxPerSecond;
    nextPxPerSecond = clamp(nextPxPerSecond, 2, 220);
    if (nextPxPerSecond === oldPx) return;
    const localX = getTimelineLocalXFromClientX(clientX);
    const timeAtPointer = getTimelineContentXFromClientX(clientX) / oldPx;
    state.pxPerSecond = nextPxPerSecond;
    document.documentElement.style.setProperty('--timeline-unit', state.pxPerSecond + 'px');
    renderAll();
    els.timelineScroll.scrollLeft = Math.max(0, timeAtPointer * state.pxPerSecond - localX);
    renderPlayhead();
  }

  function serializeProject() {
    return {
      version: 8,
      canvasPreset: els.canvasPreset.value,
      currentTime: state.currentTime,
      pxPerSecond: state.pxPerSecond,
      selectedLayerId: state.selectedLayerId,
      layers: state.layers.map(layer => ({
        id: layer.id,
        name: layer.name,
        visible: layer.visible,
        clips: layer.clips.map(clip => ({
          id: clip.id,
          kind: clip.kind,
          label: clip.label,
          start: clip.start,
          duration: clip.duration,
          mediaDuration: clip.mediaDuration,
          volume: clip.volume,
          text: clip.text || '',
          fontSize: clip.fontSize || 48,
          color: clip.color || '#ffffff',
          fontFamily: clip.fontFamily || 'Arial',
          textAnimation: clip.textAnimation || 'none',
          exposure: Number(clip.exposure) || 0,
          brightness: Number.isFinite(Number(clip.brightness)) ? Number(clip.brightness) : 100,
          contrast: Number.isFinite(Number(clip.contrast)) ? Number(clip.contrast) : 100,
          hue: Number(clip.hue) || 0,
          playbackRate: getClipPlaybackRate(clip),
          fadeType: getClipFadeType(clip),
          fadeDuration: getClipFadeDuration(clip),
          posX: Number(clip.posX) || 0,
          posY: Number(clip.posY) || 0,
          scale: Math.max(0.1, Number(clip.scale) || 1),
          rotation: Number(clip.rotation) || 0,
          trimStart: Math.max(0, Number(clip.trimStart) || 0),
          src: clip.src,
          mimeType: clip.mimeType || '',
          fileName: clip.fileName || clip.label,
          scrubRegions: cloneScrubRegions(clip.scrubRegions),
          effects: JSON.parse(JSON.stringify(ensureEffectsArray(clip))),
          waveformDataUrl: clip.waveformDataUrl || '',
          transitionType: clip.transitionType || 'crossfade',
          fromClipId: clip.fromClipId || '',
          toClipId: clip.toClipId || '',
          wipeSubtype: clip.wipeSubtype || 'color',
          wipeColor: clip.wipeColor || '#ffffff',
          wipeClipId: clip.wipeClipId || '',
          wipeEdgeFalloff: clamp(Number(clip.wipeEdgeFalloff) || 0, 0, 100),
          wipeAngle: Number.isFinite(Number(clip.wipeAngle)) ? Number(clip.wipeAngle) : 0,
        }))
      }))
    };
  }

  async function blobToDataURL(blob) {
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  async function dataURLToBlob(dataUrl) {
    const response = await fetch(dataUrl);
    return await response.blob();
  }

  function sanitizeEmbeddedFileName(name, fallback = 'media.bin') {
    const value = String(name || fallback).trim() || fallback;
    return value.replace(/[\/:*?"<>|]+/g, '_');
  }

  function triggerBlobDownload(blob, fileName) {
    const a = document.createElement('a');
    const downloadUrl = URL.createObjectURL(blob);
    a.href = downloadUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(downloadUrl), 4000);
  }

  async function buildProjectBundle(project) {
    const manifest = JSON.parse(JSON.stringify(project));
    manifest.version = Math.max(8, Number(manifest.version) || 0);
    manifest.bundleFormat = 'SVB1';
    const embeddedMedia = [];

    for (let layerIndex = 0; layerIndex < manifest.layers.length; layerIndex++) {
      const layer = manifest.layers[layerIndex];
      const liveLayer = state.layers[layerIndex];
      for (let clipIndex = 0; clipIndex < layer.clips.length; clipIndex++) {
        const clip = layer.clips[clipIndex];
        const liveClip = liveLayer?.clips?.[clipIndex] || null;
        if (clip.kind === 'text' || clip.kind === 'transition') continue;
        if (!clip.src && !(liveClip?.sourceFile instanceof Blob)) continue;
        try {
          let mediaBlob = null;
          if (liveClip?.sourceFile instanceof Blob) {
            mediaBlob = liveClip.sourceFile;
          } else if (clip.src?.startsWith('data:')) {
            mediaBlob = await dataURLToBlob(clip.src);
          } else if (clip.src) {
            const response = await fetch(clip.src);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            mediaBlob = await response.blob();
          }
          if (!(mediaBlob instanceof Blob)) continue;
          const fileName = sanitizeEmbeddedFileName(clip.fileName || clip.label || `clip_${layerIndex+1}_${clipIndex+1}`);
          const mimeType = clip.mimeType || mediaBlob.type || 'application/octet-stream';
          const index = embeddedMedia.length;
          embeddedMedia.push({ blob: mediaBlob, fileName, mimeType, size: mediaBlob.size });
          clip.src = `embedded:${index}`;
          clip.mimeType = mimeType;
          clip.fileName = fileName;
        } catch (err) {
          console.error('Failed to embed clip for bundled save', clip, err);
          const name = clip.fileName || clip.label || 'clip';
          throw new Error(`Could not save media for "${name}".`);
        }
      }
    }

    manifest.embeddedMedia = embeddedMedia.map(({ fileName, mimeType, size }) => ({ fileName, mimeType, size }));
    const manifestBytes = new TextEncoder().encode(JSON.stringify(manifest));
    const headerBytes = new TextEncoder().encode('SVB1');
    const lengthBytes = new Uint8Array(4);
    new DataView(lengthBytes.buffer).setUint32(0, manifestBytes.length, true);
    const blobParts = [headerBytes, lengthBytes, manifestBytes];
    for (const item of embeddedMedia) blobParts.push(item.blob);
    return new Blob(blobParts, { type: 'application/octet-stream' });
  }

  async function parseProjectBundle(file) {
    const buffer = await file.arrayBuffer();
    if (buffer.byteLength < 8) throw new Error('Project file is too small.');
    const bytes = new Uint8Array(buffer);
    const signature = new TextDecoder().decode(bytes.slice(0, 4));
    if (signature !== 'SVB1') throw new Error('Unsupported project bundle format.');
    const view = new DataView(buffer);
    const manifestLength = view.getUint32(4, true);
    const manifestStart = 8;
    const manifestEnd = manifestStart + manifestLength;
    if (manifestEnd > buffer.byteLength) throw new Error('Project bundle manifest is truncated.');
    const manifestText = new TextDecoder().decode(bytes.slice(manifestStart, manifestEnd));
    const project = JSON.parse(manifestText);
    const embeddedMedia = Array.isArray(project.embeddedMedia) ? project.embeddedMedia : [];
    let offset = manifestEnd;
    const blobUrlsToRevoke = [];

    for (let i = 0; i < embeddedMedia.length; i++) {
      const meta = embeddedMedia[i] || {};
      const size = Math.max(0, Number(meta.size) || 0);
      const end = offset + size;
      if (end > buffer.byteLength) throw new Error(`Embedded media ${i + 1} is truncated.`);
      const blob = new Blob([buffer.slice(offset, end)], { type: meta.mimeType || 'application/octet-stream' });
      const objectUrl = URL.createObjectURL(blob);
      blobUrlsToRevoke.push(objectUrl);
      offset = end;
      for (const layer of project.layers || []) {
        for (const clip of layer.clips || []) {
          if (clip?.src === `embedded:${i}`) {
            clip.src = objectUrl;
            clip.mimeType = clip.mimeType || meta.mimeType || '';
            clip.fileName = clip.fileName || meta.fileName || `media_${i + 1}`;
            clip.sourceFile = new File([blob], clip.fileName, { type: clip.mimeType || meta.mimeType || 'application/octet-stream' });
          }
        }
      }
    }

    delete project.embeddedMedia;
    return { project, blobUrlsToRevoke };
  }

  async function saveProject() {
    setStatus('Saving project...');
    const project = serializeProject();
    const bundleBlob = await buildProjectBundle(project);
    triggerBlobDownload(bundleBlob, 'sanityvideo_project.layercut');
    setStatus(`${APP_BRAND} project saved.`);
  }

  async function loadProjectFromObject(project, options = {}) {
    if (!project || !Array.isArray(project.layers)) throw new Error('Invalid project file');
    state.playing = false;
    state.layers = [];
    state.selectedClipId = null;
    for (const layerData of project.layers) {
      const layer = { id: layerData.id || uid('layer'), name: layerData.name || 'Layer', visible: layerData.visible !== false, clips: [] };
      for (const clipData of layerData.clips || []) {
        const media = (clipData.kind === 'text' || clipData.kind === 'transition') ? null : await createMediaElement(clipData.kind, clipData.src);
        if (media instanceof HTMLMediaElement) await ensureAudioGraphFor(media);
        layer.clips.push({
          id: clipData.id || uid('clip'),
          kind: clipData.kind,
          label: (clipData.kind === 'text' ? summarizeTextClipLabel(clipData.text || clipData.label || 'Text Clip') : (clipData.label || clipData.fileName || 'Clip')),
          text: clipData.text || '',
          fontSize: Number(clipData.fontSize) || 48,
          color: clipData.color || '#ffffff',
          fontFamily: clipData.fontFamily || 'Arial',
          textAnimation: clipData.textAnimation || 'none',
          exposure: Number(clipData.exposure) || 0,
          brightness: Number.isFinite(Number(clipData.brightness)) ? Number(clipData.brightness) : 100,
          contrast: Number.isFinite(Number(clipData.contrast)) ? Number(clipData.contrast) : 100,
          hue: Number(clipData.hue) || 0,
          playbackRate: Math.max(0.25, Number(clipData.playbackRate) || 1),
          fadeType: ['none', 'in', 'out', 'inout'].includes(String(clipData.fadeType || 'none').toLowerCase()) ? String(clipData.fadeType || 'none').toLowerCase() : 'none',
          fadeDuration: Math.max(0, Number(clipData.fadeDuration) || 0),
          posX: Number.isFinite(Number(clipData.posX)) ? Number(clipData.posX) : 0,
          posY: Number.isFinite(Number(clipData.posY)) ? Number(clipData.posY) : 0,
          scale: Math.max(0.1, Number(clipData.scale) || 1),
          rotation: Number.isFinite(Number(clipData.rotation)) ? Number(clipData.rotation) : 0,
          trimStart: Math.max(0, Number(clipData.trimStart) || 0),
          start: Number(clipData.start) || 0,
          duration: Number(clipData.duration) || (clipData.kind === 'text' ? DEFAULT_TEXT_DURATION : DEFAULT_IMAGE_DURATION),
          mediaDuration: Number(clipData.mediaDuration) || (clipData.kind === 'text' ? DEFAULT_TEXT_DURATION : DEFAULT_IMAGE_DURATION),
          volume: clipData.volume ?? 1,
          src: clipData.src || '',
          mimeType: clipData.mimeType || '',
          fileName: clipData.fileName || clipData.label || 'clip',
          sourceFile: null,
          scrubRegions: cloneScrubRegions(clipData.scrubRegions),
          effects: Array.isArray(clipData.effects) ? clipData.effects : [],
          waveformDataUrl: clipData.waveformDataUrl || '',
          transitionType: clipData.transitionType || 'crossfade',
          fromClipId: clipData.fromClipId || '',
          toClipId: clipData.toClipId || '',
          wipeSubtype: ['color','clip'].includes(String(clipData.wipeSubtype || '').toLowerCase()) ? String(clipData.wipeSubtype).toLowerCase() : 'color',
          wipeColor: clipData.wipeColor || '#ffffff',
          wipeClipId: clipData.wipeClipId || '',
          wipeEdgeFalloff: clamp(Number(clipData.wipeEdgeFalloff) || 0, 0, 100),
          wipeAngle: Number.isFinite(Number(clipData.wipeAngle)) ? Number(clipData.wipeAngle) : 0,
          element: media,
        });
      }
      state.layers.push(layer);
    }
    if (!state.layers.length) createLayer('Layer 1');
    state.selectedLayerId = project.selectedLayerId && getLayerById(project.selectedLayerId) ? project.selectedLayerId : state.layers[0].id;
    state.currentTime = Number(project.currentTime) || 0;
    state.pxPerSecond = clamp(Number(project.pxPerSecond) || 48, 2, 220);
    document.documentElement.style.setProperty('--timeline-unit', state.pxPerSecond + 'px');
    if (project.canvasPreset) {
      els.canvasPreset.value = project.canvasPreset;
      const [w, h] = project.canvasPreset.split('x').map(Number);
      els.canvas.width = w;
      els.canvas.height = h;
    }
    renderAll();
    if (!options.skipHistoryReset) {
      state.history = [];
      state.historyIndex = -1;
      pushHistory('Project loaded');
    } else {
      updateUndoRedoButtons();
    }
    setStatus(`${APP_BRAND} project loaded.`);
  }

  function combinedExportMime() {
    const candidates = [
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm'
    ];
    for (const type of candidates) {
      if (window.MediaRecorder && MediaRecorder.isTypeSupported(type)) return type;
    }
    return '';
  }

  function applyToSelectedClips(mutator, predicate = null) {
    const infos = getSelectedClipInfos();
    for (const { clip } of infos) {
      if (!predicate || predicate(clip)) mutator(clip);
    }
  }

  async function exportVideo() {
    if (state.exporting) return;
    const mimeType = combinedExportMime();
    if (!mimeType) {
      alert('This browser does not expose a usable WebM MediaRecorder export format. Tiny browser gremlin says no.');
      return;
    }
    await prepareAudioGraph();
    state.exporting = true;
    state.exportStopRequested = false;
    els.exportBtn.disabled = true;
    setStatus('Exporting in real time...');

    const canvasStream = els.canvas.captureStream(EXPORT_FPS);
    const tracks = [...canvasStream.getVideoTracks()];
    if (state.audioDestination) tracks.push(...state.audioDestination.stream.getAudioTracks());
    const exportStream = new MediaStream(tracks);
    const recorder = new MediaRecorder(exportStream, { mimeType });
    const chunks = [];
    recorder.ondataavailable = (e) => { if (e.data && e.data.size) chunks.push(e.data); };

    const done = new Promise((resolve, reject) => {
      recorder.onerror = (e) => reject(e.error || new Error('Export recorder failed'));
      recorder.onstop = () => resolve();
    });

    const previousTime = state.currentTime;
    const previousPlaying = state.playing;
    try {
      state.currentTime = 0;
      state.playing = true;
      syncAudioVideo();
      recorder.start(1000);
      const startedAt = performance.now();
      while (!state.exportStopRequested && state.currentTime < state.duration) {
        const progress = clamp(state.currentTime / Math.max(state.duration, 0.001), 0, 1);
        setStatus(`Exporting ${Math.round(progress * 100)}%...`);
        await new Promise(r => setTimeout(r, 150));
        if (performance.now() - startedAt > (state.duration + 2) * 1000) break;
      }
      state.playing = false;
      syncAudioVideo();
      recorder.stop();
      await done;
      const blob = new Blob(chunks, { type: mimeType });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'sanityvideo_export.webm';
      a.click();
      URL.revokeObjectURL(a.href);
      setStatus('Exported WebM.');
    } catch (err) {
      console.error(err);
      alert('Export failed. Some browsers are stubborn little potatoes about WebM recording.');
      setStatus('Export failed.');
    } finally {
      state.currentTime = previousTime;
      state.playing = previousPlaying;
      syncAudioVideo();
      els.exportBtn.disabled = false;
      state.exporting = false;
      drawPreview();
      renderPlayhead();
    }
  }

  els.mediaInput.addEventListener('change', async (e) => {
    const files = [...e.target.files];
    if (!files.length) return;
    try {
      await addMediaFiles(files, els.uploadLayer.value || state.selectedLayerId);
      pushHistory('Add media');
      setStatus(`${files.length} file${files.length === 1 ? '' : 's'} added.`);
    } catch (err) {
      alert('Failed to load one or more files. Browser media decoding can be a fussy little beast.');
      console.error(err);
      setStatus('Media load failed.');
    } finally {
      e.target.value = '';
    }
  });

  if (els.addLayerBtn) els.addLayerBtn.addEventListener('click', () => { createLayer('Layer ' + (state.layers.length + 1)); pushHistory('Add layer'); });
  if (els.duplicateLayerBtn) els.duplicateLayerBtn.addEventListener('click', async () => { await duplicateSelectedLayer(); pushHistory('Duplicate layer'); });
  if (els.deleteLayerBtn) els.deleteLayerBtn.addEventListener('click', () => { deleteSelectedLayer(); pushHistory('Delete layer'); });
  els.addTextClipBtn.addEventListener('click', () => { createTextClip(els.uploadLayer.value || state.selectedLayerId); pushHistory('Add text clip'); });
  els.addTransitionBtn.addEventListener('click', () => { createTransitionClip(); pushHistory('Add transition'); });
  els.toggleScrubDrawBtn.addEventListener('click', () => toggleScrubDrawMode());
  els.toggleScrubDrawBtn2.addEventListener('click', () => toggleScrubDrawMode());
  els.toggleSidebarBtn.addEventListener('click', () => {
    state.sidebarVisible = !state.sidebarVisible;
    els.app.classList.toggle('sidebar-hidden', !state.sidebarVisible);
  });
  els.projectInstructionsHeader.addEventListener('click', () => {
    els.projectInstructionsSection.classList.toggle('collapsed');
    els.projectInstructionsToggle.textContent = els.projectInstructionsSection.classList.contains('collapsed') ? '▶' : '▼';
  });


  els.playBtn.addEventListener('click', async () => {
    await prepareAudioGraph();
    state.playing = true;
  });
  els.pauseBtn.addEventListener('click', () => { state.playing = false; syncAudioVideo(); });
  els.stopBtn.addEventListener('click', () => {
    state.playing = false;
    state.currentTime = 0;
    syncAudioVideo();
    drawPreview();
    renderPlayhead();
  });
  if (els.fitPlayheadBtn) els.fitPlayheadBtn.addEventListener('click', fitTimelineView);
  if (els.splitClipBtn) els.splitClipBtn.addEventListener('click', splitSelectedClipsAtPlayhead);
  if (els.toggleSnapBtn) els.toggleSnapBtn.addEventListener('click', () => { state.snappingEnabled = !state.snappingEnabled; updateUndoRedoButtons(); pushHistory('Toggle snapping'); });
  if (els.undoBtn) els.undoBtn.addEventListener('click', undoHistory);
  if (els.redoBtn) els.redoBtn.addEventListener('click', redoHistory);
  els.saveProjectBtn.addEventListener('click', saveProject);
  els.loadProjectBtn.addEventListener('click', () => els.loadProjectInput.click());
  els.loadProjectInput.addEventListener('change', async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setStatus('Loading project...');
      const isBundle = file.name.toLowerCase().endsWith('.layercut') || file.type === 'application/octet-stream';
      if (isBundle) {
        const parsed = await parseProjectBundle(file);
        try {
          await loadProjectFromObject(parsed.project);
        } finally {
          setTimeout(() => {
            for (const url of parsed.blobUrlsToRevoke || []) URL.revokeObjectURL(url);
          }, 1000);
        }
      } else {
        const project = JSON.parse(await file.text());
        await loadProjectFromObject(project);
      }
    } catch (err) {
      console.error(err);
      alert('Project load failed. File may be malformed or cursed.');
      setStatus('Project load failed.');
    } finally {
      e.target.value = '';
    }
  });
  els.exportBtn.addEventListener('click', exportVideo);
  if (els.previewFullscreenBtn) els.previewFullscreenBtn.addEventListener('click', togglePreviewFullscreen);
  document.addEventListener('fullscreenchange', updatePreviewFullscreenButton);
  document.addEventListener('webkitfullscreenchange', updatePreviewFullscreenButton);
  updatePreviewFullscreenButton();

  let scrubbing = false;
  els.ruler.addEventListener('mousedown', (e) => {
    if (e.button !== 0) return;
    scrubbing = true;
    setCurrentTimeFromClientX(e.clientX);
    const onMove = (ev) => { if (scrubbing) setCurrentTimeFromClientX(ev.clientX); };
    const onUp = () => {
      scrubbing = false;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  });

  els.timelineContent.addEventListener('mousedown', (e) => {
    if (e.button !== 0) return;
    if (e.target.closest('.clip')) return;
    if (e.target.closest('#ruler')) return;
    setCurrentTimeFromClientX(e.clientX);
    if (!e.shiftKey) {
      state.selectedClipId = null;
      state.selectedClipIds = [];
      renderSelection();
      renderTracks();
    }
  });


  els.timelineScroll.addEventListener('mousedown', (e) => {
    if (!(e.ctrlKey && e.button === 1)) return;
    e.preventDefault();
    state.timelinePanActive = true;
    const startX = e.clientX;
    const startY = e.clientY;
    const startLeft = els.timelineScroll.scrollLeft;
    const startTop = els.timelineScroll.scrollTop;
    const onMove = (ev) => {
      if (!state.timelinePanActive) return;
      els.timelineScroll.scrollLeft = startLeft - (ev.clientX - startX);
      els.timelineScroll.scrollTop = startTop - (ev.clientY - startY);
    };
    const onUp = () => {
      state.timelinePanActive = false;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  });
  els.timelineScroll.addEventListener('auxclick', (e) => {
    if (e.button === 1) e.preventDefault();
  });

  [els.timelineContent, els.tracksArea, els.trackList, els.ruler].forEach((el) => {
    if (!el) return;
    el.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      if (el === els.timelineContent && !e.target.closest('.clip')) {
        if (!e.shiftKey) {
          state.selectedClipId = null;
          state.selectedClipIds = [];
          renderSelection();
          renderTracks();
        }
      }
      openClipContextMenu(e.clientX, e.clientY);
    });
  });

  let scrubPointerStart = null;
  els.canvas.addEventListener('mousedown', (e) => {
    if (!state.scrubDrawMode || e.button !== 0) return;
    const info = getSelectedClipInfo();
    if (!info || (info.clip.kind !== 'image' && info.clip.kind !== 'video')) return;
    e.preventDefault();
    scrubPointerStart = getCanvasNormalizedPos(e);
    state.scrubDraft = { x: scrubPointerStart.x, y: scrubPointerStart.y, w: 0.001, h: 0.001 };
    drawPreview();
    const onMove = (ev) => {
      const pos = getCanvasNormalizedPos(ev);
      state.scrubDraft = {
        x: Math.min(scrubPointerStart.x, pos.x),
        y: Math.min(scrubPointerStart.y, pos.y),
        w: Math.max(0.005, Math.abs(pos.x - scrubPointerStart.x)),
        h: Math.max(0.005, Math.abs(pos.y - scrubPointerStart.y)),
      };
      drawPreview();
    };
    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      const activeInfo = getSelectedClipInfo();
      if (activeInfo && state.scrubDraft) {
        activeInfo.clip.scrubRegions = cloneScrubRegions(activeInfo.clip.scrubRegions);
        activeInfo.clip.scrubRegions.push({
          ...state.scrubDraft,
          mode: els.scrubMode.value || 'pixelate',
          strength: Math.max(2, Number(els.scrubStrength.value) || 14),
        });
      }
      state.scrubDraft = null;
      renderSelection();
      drawPreview();
      pushHistory('Add scrub region');
      setStatus('Scrub region added.');
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  });

  els.timelineScroll.addEventListener('wheel', (e) => {
    e.preventDefault();
    els.ruler.classList.add('zooming');
    clearTimeout(els.ruler._zoomTimer);
    els.ruler._zoomTimer = setTimeout(() => els.ruler.classList.remove('zooming'), 140);
    const dir = e.deltaY < 0 ? 1.12 : 1 / 1.12;
    setZoomAtClientX(state.pxPerSecond * dir, e.clientX);
  }, { passive: false });

  els.canvasPreset.addEventListener('change', () => {
    const [w, h] = els.canvasPreset.value.split('x').map(Number);
    els.canvas.width = w;
    els.canvas.height = h;
    drawPreview();
    pushHistory('Canvas preset');
  });

  els.clipLabel.addEventListener('input', () => {
    const info = getSelectedClipInfo();
    if (!info) return;
    info.clip.label = els.clipLabel.value;
    renderTracks();
  });
  els.clipVolume.addEventListener('input', () => {
    applyToSelectedClips((clip) => { clip.volume = Number(els.clipVolume.value); }, clip => clip.kind === 'audio' || clip.kind === 'video');
  });
  els.clipStart.addEventListener('input', () => {
    const info = getSelectedClipInfo();
    if (!info) return;
    const baseSelected = getSelectedClipInfos();
    const anchor = info.clip.start;
    const target = Math.max(0, Number(els.clipStart.value) || 0);
    const delta = target - anchor;
    for (const { clip } of baseSelected) clip.start = snapTime(Math.max(0, (Number(clip.start) || 0) + delta), clip.id);
    updateProjectDuration();
    renderTracks();
    renderSelection();
  });
  els.clipDuration.addEventListener('input', () => {
    let v = Math.max(0.3, Number(els.clipDuration.value) || 0.3);
    applyToSelectedClips((clip) => {
      let next = v;
      if ((clip.kind === 'video' || clip.kind === 'audio') && clip.mediaDuration != null) next = Math.min(next, getMaxPlayableDuration(clip));
      clip.duration = next;
      clip.fadeDuration = Math.min(getClipFadeDuration(clip), Math.max(0, next / 2));
    });
    updateProjectDuration();
    renderTracks();
    renderSelection();
    drawPreview();
    syncAudioVideo();
  });
  els.clipFadeType.addEventListener('change', () => {
    applyToSelectedClips((clip) => { clip.fadeType = getClipFadeType({ fadeType: els.clipFadeType.value }); });
    drawPreview();
    syncAudioVideo();
  });
  els.clipFadeDuration.addEventListener('input', () => {
    applyToSelectedClips((clip) => {
      const maxFade = Math.max(0, (Number(clip.duration) || 0) / 2);
      clip.fadeDuration = clamp(Number(els.clipFadeDuration.value) || 0, 0, Math.max(0, maxFade));
    });
    const info = getSelectedClipInfo();
    if (info) els.clipFadeDuration.value = info.clip.fadeDuration.toFixed(1).replace(/\.0$/, '');
    drawPreview();
    syncAudioVideo();
  });
  els.clipText.addEventListener('input', () => {
    const info = getSelectedClipInfo();
    if (!info || info.clip.kind !== 'text' || getSelectedClipInfos().length !== 1) return;
    info.clip.text = els.clipText.value;
    info.clip.label = summarizeTextClipLabel(els.clipText.value);
    drawPreview();
    renderTracks();
  });
  els.clipFontSize.addEventListener('input', () => {
    applyToSelectedClips((clip) => { clip.fontSize = Math.max(12, Number(els.clipFontSize.value) || 48); }, clip => clip.kind === 'text');
    drawPreview();
  });
  els.clipColor.addEventListener('input', () => {
    applyToSelectedClips((clip) => { clip.color = els.clipColor.value || '#ffffff'; }, clip => clip.kind === 'text');
    drawPreview();
  });
  if (els.addEffectBtn) els.addEffectBtn.addEventListener('click', () => {
    const infos = getSelectedClipInfos();
    if (!infos.length) return;
    const type = els.effectTypeSelect.value || 'blur';
    const sharedId = uid('fx');
    applyToSelectedClips((clip) => {
      if (!isVisualClip(clip)) return;
      ensureEffectsArray(clip).push({ id: sharedId, type, value: defaultEffectValue(type) });
    });
    renderSelection();
    drawPreview();
    pushHistory('Add effect');
  });
  if (els.clipFontFamily) els.clipFontFamily.addEventListener('input', () => { applyToSelectedClips(clip => { clip.fontFamily = els.clipFontFamily.value; }, clip => clip.kind === 'text'); drawPreview(); });
  if (els.clipTextAnimation) els.clipTextAnimation.addEventListener('input', () => { applyToSelectedClips(clip => { clip.textAnimation = els.clipTextAnimation.value; }, clip => clip.kind === 'text'); drawPreview(); });
  if (els.transitionType) els.transitionType.addEventListener('input', () => { applyToSelectedClips(clip => { clip.transitionType = els.transitionType.value; if (clip.transitionType !== 'wipe') clip.wipeSubtype = clip.wipeSubtype || 'color'; }, clip => clip.kind === 'transition'); renderSelection(); drawPreview(); renderTracks(); });
  if (els.wipeSubtype) els.wipeSubtype.addEventListener('input', () => { applyToSelectedClips(clip => { clip.wipeSubtype = els.wipeSubtype.value === 'clip' ? 'clip' : 'color'; if (clip.wipeSubtype === 'clip' && !clip.wipeClipId) clip.wipeClipId = clip.toClipId || clip.fromClipId || ''; }, clip => clip.kind === 'transition' && String(clip.transitionType || 'crossfade') === 'wipe'); renderSelection(); drawPreview(); });
  if (els.wipeColor) els.wipeColor.addEventListener('input', () => { applyToSelectedClips(clip => { clip.wipeColor = els.wipeColor.value || '#ffffff'; }, clip => clip.kind === 'transition' && String(clip.transitionType || 'crossfade') === 'wipe'); drawPreview(); });
  if (els.wipeClipId) els.wipeClipId.addEventListener('input', () => { applyToSelectedClips(clip => { clip.wipeClipId = els.wipeClipId.value || ''; }, clip => clip.kind === 'transition' && String(clip.transitionType || 'crossfade') === 'wipe'); drawPreview(); });
  if (els.wipeEdgeFalloff) els.wipeEdgeFalloff.addEventListener('input', () => { applyToSelectedClips(clip => { clip.wipeEdgeFalloff = clamp(Number(els.wipeEdgeFalloff.value) || 0, 0, 100); }, clip => clip.kind === 'transition' && String(clip.transitionType || 'crossfade') === 'wipe'); drawPreview(); });
  if (els.wipeAngle) els.wipeAngle.addEventListener('input', () => { applyToSelectedClips(clip => { clip.wipeAngle = clamp(Number(els.wipeAngle.value) || 0, -360, 360); }, clip => clip.kind === 'transition' && String(clip.transitionType || 'crossfade') === 'wipe'); drawPreview(); });
  els.clipExposure.addEventListener('input', () => {
    applyToSelectedClips((clip) => { clip.exposure = clamp(Number(els.clipExposure.value) || 0, -3, 3); }, clip => clip.kind === 'video');
    drawPreview();
  });
  els.clipBrightness.addEventListener('input', () => {
    applyToSelectedClips((clip) => { clip.brightness = clamp(Number(els.clipBrightness.value) || 100, 0, 200); }, clip => clip.kind === 'video');
    drawPreview();
  });
  els.clipContrast.addEventListener('input', () => {
    applyToSelectedClips((clip) => { clip.contrast = clamp(Number(els.clipContrast.value) || 100, 0, 200); }, clip => clip.kind === 'video');
    drawPreview();
  });
  els.clipHue.addEventListener('input', () => {
    applyToSelectedClips((clip) => { clip.hue = clamp(Number(els.clipHue.value) || 0, -180, 180); }, clip => clip.kind === 'video');
    drawPreview();
  });
  els.clipSpeed.addEventListener('input', () => {
    applyToSelectedClips((clip) => { clip.playbackRate = Math.max(0.25, Number(els.clipSpeed.value) || 1); normalizeClipTiming(clip); }, clip => clip.kind === 'video');
    updateProjectDuration();
    renderTracks();
    renderSelection();
    syncAudioVideo();
    drawPreview();
  });
  els.clipPosX.addEventListener('input', () => {
    applyToSelectedClips((clip) => { ensureClipDefaults(clip); clip.posX = clamp((Number(els.clipPosX.value) || 0) / 100, -1, 1); }, clip => isVisualClip(clip));
    drawPreview();
  });
  els.clipPosY.addEventListener('input', () => {
    applyToSelectedClips((clip) => { ensureClipDefaults(clip); clip.posY = clamp((Number(els.clipPosY.value) || 0) / 100, -1, 1); }, clip => isVisualClip(clip));
    drawPreview();
  });
  els.clipScale.addEventListener('input', () => {
    applyToSelectedClips((clip) => { ensureClipDefaults(clip); clip.scale = clamp((Number(els.clipScale.value) || 100) / 100, 0.1, 4); }, clip => isVisualClip(clip));
    drawPreview();
  });
  els.clipRotation.addEventListener('input', () => {
    applyToSelectedClips((clip) => { ensureClipDefaults(clip); clip.rotation = clamp(Number(els.clipRotation.value) || 0, -360, 360); }, clip => isVisualClip(clip));
    drawPreview();
  });
  els.scrubMode.addEventListener('change', () => {
    const info = getSelectedClipInfo();
    if (!info || !(info.clip.kind === 'image' || info.clip.kind === 'video')) return;
    info.clip.scrubRegions = cloneScrubRegions(info.clip.scrubRegions);
    const last = info.clip.scrubRegions[info.clip.scrubRegions.length - 1];
    if (last) last.mode = els.scrubMode.value;
    drawPreview();
  });
  els.scrubStrength.addEventListener('input', () => {
    const info = getSelectedClipInfo();
    if (!info || !(info.clip.kind === 'image' || info.clip.kind === 'video')) return;
    info.clip.scrubRegions = cloneScrubRegions(info.clip.scrubRegions);
    const last = info.clip.scrubRegions[info.clip.scrubRegions.length - 1];
    if (last) last.strength = Math.max(2, Number(els.scrubStrength.value) || 14);
    drawPreview();
  });
  els.deleteScrubBtn.addEventListener('click', () => {
    const info = getSelectedClipInfo();
    if (!info || !(info.clip.kind === 'image' || info.clip.kind === 'video')) return;
    info.clip.scrubRegions = cloneScrubRegions(info.clip.scrubRegions);
    info.clip.scrubRegions.pop();
    renderSelection();
    drawPreview();
    pushHistory('Delete scrub region');
    setStatus('Last scrub region removed.');
  });

  if (els.sanitizeMediaBtn) els.sanitizeMediaBtn.addEventListener('click', sanitizeSelectedMedia);

  function deleteSelectedClips() {
    const infos = getSelectedClipInfos();
    if (!infos.length) return;
    for (const { layer, clip } of infos) {
      const idx = layer.clips.indexOf(clip);
      if (idx >= 0) layer.clips.splice(idx, 1);
    }
    state.selectedClipId = null;
    state.selectedClipIds = [];
    closeClipContextMenu();
    renderAll();
    pushHistory('Delete clip');
    setStatus(infos.length > 1 ? 'Selected clips deleted.' : 'Selected clip deleted.');
  }

  els.deleteClipBtn.addEventListener('click', deleteSelectedClips);

  [
    els.clipLabel, els.clipVolume, els.clipStart, els.clipDuration, els.clipFadeType, els.clipFadeDuration,
    els.clipText, els.clipFontSize, els.clipColor, els.clipFontFamily, els.clipTextAnimation, els.transitionType, els.wipeSubtype, els.wipeColor, els.wipeClipId, els.wipeEdgeFalloff, els.wipeAngle, els.effectTypeSelect, els.clipExposure, els.clipBrightness, els.clipContrast, els.clipHue, els.clipSpeed,
    els.clipPosX, els.clipPosY, els.clipScale, els.clipRotation, els.scrubMode, els.scrubStrength
  ].forEach(primeHistoryForControl);

  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key.toLowerCase() === 'z') { e.preventDefault(); undoHistory(); }
    else if (((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') || ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'z')) { e.preventDefault(); redoHistory(); }
    else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') { e.preventDefault(); splitSelectedClipsAtPlayhead(); }
  });

  setStatus('Ready. Magnet snapping, multi-select, split, transforms, and undo/redo are armed.');
  createLayer('Layer 1');
  createLayer('Layer 2');
  createLayer('Layer 3');
  renderAll();
  pushHistory('Initial');
  updateUndoRedoButtons();
  requestAnimationFrame(frame);
})();