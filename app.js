(() => {
  const APP_BRAND = 'SanityVideo © 2026';
  const DEFAULT_IMAGE_DURATION = 5;
  const DEFAULT_TEXT_DURATION = 4;
  const EXPORT_FPS = 30;
  const COMPATIBILITY_STARTUP_STORAGE_KEY = 'sanityvideo-show-compatibility-on-startup-v1';
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
    mediaPlayRequestMap: new WeakMap(),
    forceMediaSync: false,
    exporting: false,
    exportStopRequested: false,
    exportPlaybackEnd: null,
    exportRenderScale: 1,
    scrubDrawMode: false,
    scrubDraft: null,
    waveformJobs: new WeakMap(),
    historyRestoring: false,
    pendingHistoryTimer: null,
    pendingHistoryLabel: '',
    showPreviewTimeOverlay: true,
    fullscreenControlsHideTimer: null,
    fullscreenScrubbing: false,
    clipClipboard: [],
    mobileMultiSelectMode: false,
    mobileView: 'preview',
    mobileFullscreenFallback: false,
    pendingImportLayerId: null,
    gifEncodingActive: false,
    uiScale: { topbar: 1, project: 1, clip: 1, preview: 1, inspector: 1, timeline: 1 },
    donationReturnFocus: null,
  };

  const els = {
    app: document.getElementById('app'),
    sidebar: document.getElementById('sidebar'),
    toggleSidebarBtn: document.getElementById('toggleSidebarBtn'),
    trackListPane: document.getElementById('trackListPane'),
    trackList: document.getElementById('trackList'),
    tracksArea: document.getElementById('tracksArea'),
    ruler: document.getElementById('ruler'),
    playhead: document.getElementById('playhead'),
    timelineContent: document.getElementById('timelineContent'),
    timelineScroll: document.getElementById('timelineScroll'),
    viewerPane: document.getElementById('viewerPane'),
    previewShell: document.getElementById('previewShell'),
    previewFullscreenBtn: document.getElementById('previewFullscreenBtn'),
    mobileFullscreenExitBtn: document.getElementById('mobileFullscreenExitBtn'),
    previewFullscreenControls: document.getElementById('previewFullscreenControls'),
    fullscreenPlayBtn: document.getElementById('fullscreenPlayBtn'),
    fullscreenPauseBtn: document.getElementById('fullscreenPauseBtn'),
    fullscreenStopBtn: document.getElementById('fullscreenStopBtn'),
    fullscreenScrubber: document.getElementById('fullscreenScrubber'),
    fullscreenTimeDisplay: document.getElementById('fullscreenTimeDisplay'),
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
    zoomOutBtn: document.getElementById('zoomOutBtn'),
    zoomInBtn: document.getElementById('zoomInBtn'),
    mobileMultiSelectBtn: document.getElementById('mobileMultiSelectBtn'),
    mobileClipActionsBtn: document.getElementById('mobileClipActionsBtn'),
    mobileNav: document.getElementById('mobileNav'),
    mobileSettingsBtn: document.getElementById('mobileSettingsBtn'),
    mobileSidebarBackdrop: document.getElementById('mobileSidebarBackdrop'),
    mobileHeaderMenuBtn: document.getElementById('mobileHeaderMenuBtn'),
    mobileImportBtn: document.getElementById('mobileImportBtn'),
    mobileMediaInput: document.getElementById('mobileMediaInput'),
    mobilePlayPauseBtn: document.getElementById('mobilePlayPauseBtn'),
    mobileStopBtn: document.getElementById('mobileStopBtn'),
    mobileUndoBtn: document.getElementById('mobileUndoBtn'),
    mobileExportBtn: document.getElementById('mobileExportBtn'),
    mobileHeaderTime: document.getElementById('mobileHeaderTime'),
    mobileViewLabel: document.getElementById('mobileViewLabel'),
    mobileProjectCloseBtn: document.getElementById('mobileProjectCloseBtn'),
    mobileAddLayerBtn: document.getElementById('mobileAddLayerBtn'),
    mobileDuplicateLayerBtn: document.getElementById('mobileDuplicateLayerBtn'),
    mobileDeleteLayerBtn: document.getElementById('mobileDeleteLayerBtn'),
    mobileSplitBtn: document.getElementById('mobileSplitBtn'),
    mobileSnapBtn: document.getElementById('mobileSnapBtn'),
    mobileTimelineZoomOutBtn: document.getElementById('mobileTimelineZoomOutBtn'),
    mobileTimelineZoomInBtn: document.getElementById('mobileTimelineZoomInBtn'),
    mobileTimelineFitBtn: document.getElementById('mobileTimelineFitBtn'),
    saveProjectBtn: document.getElementById('saveProjectBtn'),
    loadProjectBtn: document.getElementById('loadProjectBtn'),
    loadProjectInput: document.getElementById('loadProjectInput'),
    exportBtn: document.getElementById('exportBtn'),
    clipContextMenu: null,
    clipContextMenuItems: null,
    toggleScrubDrawBtn: document.getElementById('toggleScrubDrawBtn'),
    timeDisplay: document.getElementById('timeDisplay'),
    togglePreviewTimeOverlay: document.getElementById('togglePreviewTimeOverlay'),
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
    clipInvert: document.getElementById('clipInvert'),
    videoFxFields: document.getElementById('videoFxFields'),
    transitionFields: document.getElementById('transitionFields'),
    transitionType: document.getElementById('transitionType'),
    transitionLinkInfo: document.getElementById('transitionLinkInfo'),
    wipeFields: document.getElementById('wipeFields'),
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
    resetClipExposure: document.getElementById('resetClipExposure'),
    resetClipBrightness: document.getElementById('resetClipBrightness'),
    resetClipContrast: document.getElementById('resetClipContrast'),
    resetClipHue: document.getElementById('resetClipHue'),
    resetClipSpeed: document.getElementById('resetClipSpeed'),
    scrubFields: document.getElementById('scrubFields'),
    scrubCount: document.getElementById('scrubCount'),
    scrubMode: document.getElementById('scrubMode'),
    scrubStrength: document.getElementById('scrubStrength'),
    toggleScrubDrawBtn2: document.getElementById('toggleScrubDrawBtn2'),
    deleteScrubBtn: document.getElementById('deleteScrubBtn'),
    deleteClipBtn: document.getElementById('deleteClipBtn'),
    projectInstructionsSection: document.getElementById('projectInstructionsSection'),
    projectInstructionsHeader: document.getElementById('projectInstructionsHeader'),
    projectInstructionsToggle: document.getElementById('projectInstructionsToggle'),
    helpDonateBtn: document.getElementById('helpDonateBtn'),
    donationOverlay: document.getElementById('donationOverlay'),
    donationTitle: document.getElementById('donationTitle'),
    closeDonationBtn: document.getElementById('closeDonationBtn'),
    donationOkayBtn: document.getElementById('donationOkayBtn'),
    donationDisclaimerStep: document.getElementById('donationDisclaimerStep'),
    donationLinksStep: document.getElementById('donationLinksStep'),
    startupOverlay: document.getElementById('startupOverlay'),
    startupCompatGrid: document.getElementById('startupCompatGrid'),
    closeStartupPanelBtn: document.getElementById('closeStartupPanelBtn'),
    dontShowCompatibilityAgain: document.getElementById('dontShowCompatibilityAgain'),
    showCompatibilityOnStartup: document.getElementById('showCompatibilityOnStartup'),
    openCompatibilityBtn: document.getElementById('openCompatibilityBtn'),
    compatibilityPreferenceStatus: document.getElementById('compatibilityPreferenceStatus'),
    uiSettingsBtn: document.getElementById('uiSettingsBtn'),
    uiSettingsOverlay: document.getElementById('uiSettingsOverlay'),
    closeUiSettingsBtn: document.getElementById('closeUiSettingsBtn'),
    doneUiSettingsBtn: document.getElementById('doneUiSettingsBtn'),
    resetUiScalingBtn: document.getElementById('resetUiScalingBtn'),
    installAppBtn: document.getElementById('installAppBtn'),
    installAppStatus: document.getElementById('installAppStatus'),
    iosInstallSteps: document.getElementById('iosInstallSteps'),
    uiScaleInputs: [...document.querySelectorAll('[data-ui-scale]')],
    exportOverlay: document.getElementById('exportOverlay'),
    closeExportBtn: document.getElementById('closeExportBtn'),
    cancelExportBtn: document.getElementById('cancelExportBtn'),
    stopExportBtn: document.getElementById('stopExportBtn'),
    startExportBtn: document.getElementById('startExportBtn'),
    exportMode: document.getElementById('exportMode'),
    exportFormat: document.getElementById('exportFormat'),
    exportFileName: document.getElementById('exportFileName'),
    exportVideoOptions: document.getElementById('exportVideoOptions'),
    exportAudioOptions: document.getElementById('exportAudioOptions'),
    exportRangeOptions: document.getElementById('exportRangeOptions'),
    exportImageOptions: document.getElementById('exportImageOptions'),
    exportResolution: document.getElementById('exportResolution'),
    exportCustomResolution: document.getElementById('exportCustomResolution'),
    exportWidth: document.getElementById('exportWidth'),
    exportHeight: document.getElementById('exportHeight'),
    exportFps: document.getElementById('exportFps'),
    exportVideoBitrate: document.getElementById('exportVideoBitrate'),
    exportAudioBitrate: document.getElementById('exportAudioBitrate'),
    exportCompressedAudioQuality: document.getElementById('exportCompressedAudioQuality'),
    exportWavSampleRateField: document.getElementById('exportWavSampleRateField'),
    exportWavBitDepthField: document.getElementById('exportWavBitDepthField'),
    exportWavChannelsField: document.getElementById('exportWavChannelsField'),
    exportWavSampleRate: document.getElementById('exportWavSampleRate'),
    exportWavBitDepth: document.getElementById('exportWavBitDepth'),
    exportWavChannels: document.getElementById('exportWavChannels'),
    exportGifOptions: document.getElementById('exportGifOptions'),
    exportGifResolution: document.getElementById('exportGifResolution'),
    exportGifCustomResolution: document.getElementById('exportGifCustomResolution'),
    exportGifWidth: document.getElementById('exportGifWidth'),
    exportGifHeight: document.getElementById('exportGifHeight'),
    exportGifFps: document.getElementById('exportGifFps'),
    exportGifColors: document.getElementById('exportGifColors'),
    exportGifDither: document.getElementById('exportGifDither'),
    exportGifLoop: document.getElementById('exportGifLoop'),
    exportGifIncludeTimeOverlay: document.getElementById('exportGifIncludeTimeOverlay'),
    exportIncludeAudio: document.getElementById('exportIncludeAudio'),
    exportIncludeTimeOverlay: document.getElementById('exportIncludeTimeOverlay'),
    exportRange: document.getElementById('exportRange'),
    exportCustomRange: document.getElementById('exportCustomRange'),
    exportStart: document.getElementById('exportStart'),
    exportEnd: document.getElementById('exportEnd'),
    exportImageQuality: document.getElementById('exportImageQuality'),
    exportImageScale: document.getElementById('exportImageScale'),
    exportCapability: document.getElementById('exportCapability'),
    exportProgressWrap: document.getElementById('exportProgressWrap'),
    exportProgress: document.getElementById('exportProgress'),
    exportProgressText: document.getElementById('exportProgressText'),
    exportModeShortcuts: [...document.querySelectorAll('[data-export-mode-shortcut]')],
  };
  const ctx = els.canvas.getContext('2d');


  function syncTrackListScroll() {
    if (!els.trackListPane || !els.timelineScroll) return;
    if (els.trackListPane.scrollTop !== els.timelineScroll.scrollTop) {
      els.trackListPane.scrollTop = els.timelineScroll.scrollTop;
    }
  }

  function uid(prefix = 'id') { return prefix + '_' + Math.random().toString(36).slice(2, 10); }
  function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
  function roundToTenth(v) { return Math.round(v * 10) / 10; }
  function setStatus(msg) { els.statusLine.textContent = msg; }
  function getRenderPixelScale() { return state.exporting ? clamp(Number(state.exportRenderScale) || 1, 0.1, 8) : 1; }


  function isMobileLayout() {
    return window.matchMedia && window.matchMedia('(max-width: 900px)').matches;
  }

  function isPrimaryPointer(e) {
    return e.pointerType !== 'mouse' || e.button === 0;
  }

  function beginWindowPointerDrag(e, onMove, onEnd) {
    const pointerId = e.pointerId;
    const move = (ev) => {
      if (ev.pointerId !== pointerId) return;
      if (ev.cancelable) ev.preventDefault();
      onMove(ev);
    };
    const end = (ev) => {
      if (ev.pointerId !== pointerId) return;
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', end);
      window.removeEventListener('pointercancel', end);
      onEnd(ev);
    };
    window.addEventListener('pointermove', move, { passive: false });
    window.addEventListener('pointerup', end);
    window.addEventListener('pointercancel', end);
  }

  function setMobileView(view) {
    const next = ['preview', 'timeline', 'edit', 'project'].includes(view) ? view : 'preview';
    state.mobileView = next;
    if (els.mobileViewLabel) els.mobileViewLabel.textContent = next === 'project' ? 'Project' : next[0].toUpperCase() + next.slice(1);
    if (els.app) els.app.dataset.mobileView = next === 'project' ? 'preview' : next;
    if (els.mobileNav) {
      els.mobileNav.querySelectorAll('[data-mobile-view]').forEach((button) => {
        button.setAttribute('aria-pressed', button.dataset.mobileView === next ? 'true' : 'false');
      });
    }
    if (els.app) els.app.classList.toggle('mobile-sidebar-open', next === 'project');
    if (els.mobileSidebarBackdrop) els.mobileSidebarBackdrop.setAttribute('aria-hidden', next === 'project' ? 'false' : 'true');
    requestAnimationFrame(() => {
      updateViewportSideBanners();
      if (next === 'timeline') {
        renderTracks();
        renderRuler();
        renderPlayhead();
      } else if (next === 'preview') {
        drawPreview();
      }
    });
  }

  function closeMobileSidebar() {
    if (!els.app) return;
    els.app.classList.remove('mobile-sidebar-open');
    if (els.mobileSidebarBackdrop) els.mobileSidebarBackdrop.setAttribute('aria-hidden', 'true');
    if (state.mobileView === 'project') setMobileView('preview');
  }

  function updateMobileMultiSelectButton() {
    if (!els.mobileMultiSelectBtn) return;
    els.mobileMultiSelectBtn.textContent = `Multi-select: ${state.mobileMultiSelectMode ? 'On' : 'Off'}`;
    els.mobileMultiSelectBtn.setAttribute('aria-pressed', state.mobileMultiSelectMode ? 'true' : 'false');
    els.mobileMultiSelectBtn.classList.toggle('primary', state.mobileMultiSelectMode);
  }

  function mobileTimelineAnchorX() {
    if (!els.timelineScroll) return window.innerWidth / 2;
    const rect = els.timelineScroll.getBoundingClientRect();
    return rect.left + rect.width / 2;
  }

  function getTrackHeight() {
    const raw = getComputedStyle(document.documentElement).getPropertyValue('--track-h');
    const parsed = parseFloat(raw);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 68;
  }

  function updateMobileTransportUi() {
    if (els.mobileHeaderTime) els.mobileHeaderTime.textContent = `${formatTime(state.currentTime)} / ${formatTime(state.duration)}`;
    if (els.mobilePlayPauseBtn) {
      els.mobilePlayPauseBtn.innerHTML = state.playing
        ? '<span aria-hidden="true">Ⅱ</span><span>Pause</span>'
        : '<span aria-hidden="true">▶</span><span>Play</span>';
      els.mobilePlayPauseBtn.setAttribute('aria-pressed', state.playing ? 'true' : 'false');
    }
    if (els.mobileUndoBtn && els.undoBtn) els.mobileUndoBtn.disabled = els.undoBtn.disabled;
    if (els.mobileSnapBtn) els.mobileSnapBtn.textContent = `Magnet: ${state.snappingEnabled ? 'On' : 'Off'}`;
  }


  const UI_SCALE_STORAGE_KEY = 'sanityvideo.uiScale.v1';
  const UI_SCALE_KEYS = ['topbar', 'project', 'clip', 'preview', 'inspector', 'timeline'];

  function normalizeUiScale(value) {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return 1;
    return clamp(Math.round(parsed * 20) / 20, 0.5, 1.5);
  }

  function loadUiScalePreferences() {
    try {
      const saved = JSON.parse(localStorage.getItem(UI_SCALE_STORAGE_KEY) || '{}');
      for (const key of UI_SCALE_KEYS) state.uiScale[key] = normalizeUiScale(saved[key]);
    } catch (err) {
      console.warn('Could not load UI scaling settings.', err);
    }
  }

  function saveUiScalePreferences() {
    try {
      localStorage.setItem(UI_SCALE_STORAGE_KEY, JSON.stringify(state.uiScale));
    } catch (err) {
      console.warn('Could not save UI scaling settings.', err);
    }
  }

  function updateUiScaleControls() {
    for (const input of els.uiScaleInputs || []) {
      const key = input.dataset.uiScale;
      const value = normalizeUiScale(state.uiScale[key]);
      input.value = String(Math.round(value * 100));
      const output = input.parentElement?.querySelector('.ui-scale-value');
      if (output) output.textContent = `${Math.round(value * 100)}%`;
    }
  }

  function applyUiScalePreferences({ persist = false, rerenderTimeline = true } = {}) {
    const root = document.documentElement;
    for (const key of UI_SCALE_KEYS) state.uiScale[key] = normalizeUiScale(state.uiScale[key]);

    const mobile = isMobileLayout();
    const topbar = state.uiScale.topbar;
    const project = state.uiScale.project;
    const clip = state.uiScale.clip;
    const preview = state.uiScale.preview;
    const inspector = state.uiScale.inspector;
    const timeline = state.uiScale.timeline;

    root.style.setProperty('--topbar-ui-scale', String(topbar));
    root.style.setProperty('--project-ui-scale', String(project));
    root.style.setProperty('--clip-ui-scale', String(clip));
    root.style.setProperty('--inspector-ui-scale', String(inspector));
    root.style.setProperty('--timeline-ui-scale', String(timeline));

    const sidebarWidth = mobile
      ? Math.min(window.innerWidth * 0.96, Math.min(window.innerWidth * 0.88, 380) * project)
      : clamp(340 * project, 210, Math.max(210, window.innerWidth * 0.42));

    let clipWidth = 340 * clip;
    let inspectorWidth = 300 * inspector;
    if (!mobile) {
      const workspaceWidth = Math.max(360, window.innerWidth - sidebarWidth);
      const centerReserve = clamp(window.innerWidth * 0.28, 220, 480);
      const availableForSideWindows = Math.max(300, workspaceWidth - centerReserve);
      const desiredSideWindows = clipWidth + inspectorWidth;
      const fitFactor = Math.min(1, availableForSideWindows / Math.max(1, desiredSideWindows));
      clipWidth = clamp(clipWidth * fitFactor, 170, Math.max(170, availableForSideWindows - 130));
      inspectorWidth = clamp(inspectorWidth * fitFactor, 130, Math.max(130, availableForSideWindows - clipWidth));
    } else {
      clipWidth = clamp(clipWidth, 220, window.innerWidth);
      inspectorWidth = clamp(inspectorWidth, 190, window.innerWidth);
    }

    const timelineListWidth = mobile
      ? clamp(Math.min(window.innerWidth * 0.44, 170) * timeline, 92, window.innerWidth * 0.58)
      : clamp(290 * timeline, 270, Math.max(270, window.innerWidth * 0.40));

    root.style.setProperty('--sidebar-w', `${Math.round(sidebarWidth)}px`);
    root.style.setProperty('--clip-panel-w', `${Math.round(clipWidth)}px`);
    root.style.setProperty('--inspector-panel-w', `${Math.round(inspectorWidth)}px`);
    root.style.setProperty('--timeline-list-w', `${Math.round(timelineListWidth)}px`);
    root.style.setProperty('--track-h', `${Math.round((mobile ? 88 : 68) * timeline)}px`);
    root.style.setProperty('--ruler-h', `${Math.round(mobile ? Math.max(52, 48 * timeline) : Math.max(46, 38 * timeline))}px`);

    const baseTimelineHeight = clamp(window.innerHeight * 0.34, 260, window.innerHeight * 0.42);
    const timelineHeight = clamp(baseTimelineHeight * timeline, 210, window.innerHeight * 0.7);
    root.style.setProperty('--timeline-panel-h', `${Math.round(timelineHeight)}px`);

    root.style.setProperty('--preview-shell-width', `${Math.round(preview * 100)}%`);
    root.style.setProperty('--preview-shell-max-width', `${Math.round(960 * preview)}px`);

    updateUiScaleControls();
    if (persist) saveUiScalePreferences();

    requestAnimationFrame(() => {
      updateViewportSideBanners();
      if (rerenderTimeline) {
        renderTracks();
        renderRuler();
        renderPlayhead();
      }
      drawPreview();
    });
  }

  function setUiScale(key, percent, persist = true) {
    if (!UI_SCALE_KEYS.includes(key)) return;
    state.uiScale[key] = normalizeUiScale(Number(percent) / 100);
    applyUiScalePreferences({ persist });
  }

  let uiSettingsReturnFocus = null;

  function openUiSettings(trigger = null) {
    uiSettingsReturnFocus = trigger || (isMobileLayout() ? els.mobileSettingsBtn : els.uiSettingsBtn);
    updateUiScaleControls();
    if (els.uiSettingsOverlay) els.uiSettingsOverlay.hidden = false;
    if (els.uiSettingsBtn) els.uiSettingsBtn.setAttribute('aria-expanded', 'true');
    if (els.mobileSettingsBtn) {
      els.mobileSettingsBtn.setAttribute('aria-expanded', 'true');
      els.mobileSettingsBtn.setAttribute('aria-pressed', 'true');
    }
    const first = els.uiScaleInputs?.[0];
    if (first) requestAnimationFrame(() => first.focus({ preventScroll: true }));
  }

  function closeUiSettings() {
    if (els.uiSettingsOverlay) els.uiSettingsOverlay.hidden = true;
    if (els.uiSettingsBtn) els.uiSettingsBtn.setAttribute('aria-expanded', 'false');
    if (els.mobileSettingsBtn) {
      els.mobileSettingsBtn.setAttribute('aria-expanded', 'false');
      els.mobileSettingsBtn.setAttribute('aria-pressed', 'false');
    }
    const focusTarget = uiSettingsReturnFocus;
    uiSettingsReturnFocus = null;
    if (focusTarget && focusTarget.isConnected) focusTarget.focus({ preventScroll: true });
  }

  function resetUiScaling() {
    for (const key of UI_SCALE_KEYS) state.uiScale[key] = 1;
    applyUiScalePreferences({ persist: true });
    setStatus('All workspace windows reset to 100% scale.');
  }

  function focusWithoutScroll(element) {
    if (!element || typeof element.focus !== 'function') return;
    try { element.focus({ preventScroll: true }); } catch (err) { element.focus(); }
  }

  function openDonation() {
    if (!els.donationOverlay) return;
    state.donationReturnFocus = document.activeElement;
    if (els.donationTitle) els.donationTitle.textContent = 'Donation disclaimer';
    if (els.donationDisclaimerStep) els.donationDisclaimerStep.hidden = false;
    if (els.donationLinksStep) els.donationLinksStep.hidden = true;
    els.donationOverlay.hidden = false;
    requestAnimationFrame(() => focusWithoutScroll(els.closeDonationBtn));
  }

  function showDonationLinks() {
    if (els.donationTitle) els.donationTitle.textContent = 'Donate to CRUXTAIN';
    if (els.donationDisclaimerStep) els.donationDisclaimerStep.hidden = true;
    if (els.donationLinksStep) els.donationLinksStep.hidden = false;
    const firstLink = els.donationLinksStep?.querySelector('a');
    requestAnimationFrame(() => focusWithoutScroll(firstLink));
  }

  function closeDonation() {
    if (!els.donationOverlay || els.donationOverlay.hidden) return;
    els.donationOverlay.hidden = true;
    const returnFocus = state.donationReturnFocus;
    state.donationReturnFocus = null;
    requestAnimationFrame(() => focusWithoutScroll(returnFocus || els.helpDonateBtn));
  }


  let deferredInstallPrompt = null;

  function isIosDevice() {
    return /iphone|ipad|ipod/i.test(navigator.userAgent || '') ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  }

  function isStandaloneApp() {
    return window.matchMedia?.('(display-mode: standalone)').matches ||
      window.matchMedia?.('(display-mode: fullscreen)').matches ||
      window.navigator.standalone === true;
  }

  function canUseInstallInfrastructure() {
    return window.isSecureContext && /^https?:$/.test(window.location.protocol);
  }

  function setInstallStatus(message) {
    if (els.installAppStatus) els.installAppStatus.textContent = message;
  }

  function updateInstallAppUi() {
    if (!els.installAppBtn) return;

    const standalone = isStandaloneApp();
    const ios = isIosDevice();
    const secure = canUseInstallInfrastructure();

    if (standalone) {
      els.installAppBtn.textContent = 'SanityVideo Is Installed';
      els.installAppBtn.disabled = true;
      if (els.iosInstallSteps) els.iosInstallSteps.hidden = true;
      setInstallStatus('SanityVideo is running as an installed standalone app on this device.');
      return;
    }

    els.installAppBtn.disabled = false;
    if (!ios && els.iosInstallSteps) els.iosInstallSteps.hidden = true;
    if (!ios) els.installAppBtn.setAttribute('aria-expanded', 'false');

    if (!secure) {
      els.installAppBtn.textContent = 'HTTPS Required to Install';
      els.installAppBtn.disabled = true;
      setInstallStatus('App installation becomes available after SanityVideo is hosted over HTTPS. A local file:// copy cannot install as a browser app.');
      return;
    }

    if (ios) {
      els.installAppBtn.textContent = 'Show iPhone / iPad Install Steps';
      setInstallStatus('Apple devices install web apps through Safari’s Add to Home Screen command.');
      return;
    }

    if (deferredInstallPrompt) {
      els.installAppBtn.textContent = 'Install SanityVideo App';
      setInstallStatus('SanityVideo is ready to install as a standalone app.');
      return;
    }

    els.installAppBtn.textContent = 'Install SanityVideo App';
    setInstallStatus('The browser is checking install eligibility. If no prompt appears, use the browser menu and choose Install SanityVideo or Install app.');
  }

  async function requestSanityVideoInstall() {
    if (isStandaloneApp()) {
      updateInstallAppUi();
      return;
    }

    if (isIosDevice()) {
      if (els.iosInstallSteps) {
        els.iosInstallSteps.hidden = !els.iosInstallSteps.hidden;
        els.installAppBtn?.setAttribute('aria-expanded', String(!els.iosInstallSteps.hidden));
        if (!els.iosInstallSteps.hidden) els.iosInstallSteps.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
      setInstallStatus('Use Safari’s Share menu and select Add to Home Screen.');
      return;
    }

    if (!deferredInstallPrompt) {
      setInstallStatus('The native install prompt is not available yet. Use the browser menu and choose Install SanityVideo or Install app.');
      return;
    }

    const promptEvent = deferredInstallPrompt;
    deferredInstallPrompt = null;
    await promptEvent.prompt();
    const choice = await promptEvent.userChoice;
    if (choice?.outcome === 'accepted') {
      setInstallStatus('Installation accepted. SanityVideo will appear with your installed apps.');
    } else {
      setInstallStatus('Installation was dismissed. You can install later from this Settings section.');
    }
    updateInstallAppUi();
  }

  async function registerSanityVideoServiceWorker() {
    if (!('serviceWorker' in navigator) || !canUseInstallInfrastructure()) {
      updateInstallAppUi();
      return;
    }
    try {
      await navigator.serviceWorker.register('./service-worker.js', { scope: './' });
    } catch (error) {
      console.warn('SanityVideo service worker registration failed.', error);
      setInstallStatus('SanityVideo could not prepare offline app installation in this browser.');
    }
    updateInstallAppUi();
  }

  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferredInstallPrompt = event;
    updateInstallAppUi();
  });

  window.addEventListener('appinstalled', () => {
    deferredInstallPrompt = null;
    updateInstallAppUi();
    setStatus('SanityVideo was installed successfully.');
  });

  window.matchMedia?.('(display-mode: standalone)').addEventListener?.('change', updateInstallAppUi);


  function compatibilityStateLabel(ok, partial = false) {
    if (ok && !partial) return { label: 'Supported', cls: 'good' };
    if (ok && partial) return { label: 'Limited', cls: 'warn' };
    return { label: 'Unavailable', cls: 'bad' };
  }


  function getStartupCompatibilityReport() {
    const hasMediaRecorder = !!window.MediaRecorder;
    const supportedVideoFormats = getSupportedExportFormats('video');
    const supportedAudioFormats = getSupportedExportFormats('audio');
    const supportedGifFormats = getSupportedExportFormats('gif');
    const supportedImageFormats = getSupportedExportFormats('frame');
    const exportMime = supportedVideoFormats[0]?.value || '';
    const hasCanvasCapture = !!(els.canvas && typeof els.canvas.captureStream === 'function');
    const audioContextSupported = !!(window.AudioContext || window.webkitAudioContext);
    const mediaElementCapture = (() => {
      const probe = document.createElement('video');
      return !!(probe.captureStream || probe.mozCaptureStream);
    })();
    const exportReady = !!(hasMediaRecorder && exportMime && hasCanvasCapture);
    return [
      {
        title: 'Video Export',
        ok: exportReady,
        partial: hasMediaRecorder && hasCanvasCapture && !exportMime,
        detail: exportReady ? `${supportedVideoFormats.length} recordable format${supportedVideoFormats.length === 1 ? '' : 's'} detected.` : 'This browser cannot record the preview canvas as video.'
      },
      {
        title: 'Audio / GIF / Image Export',
        ok: supportedAudioFormats.length > 0 && supportedGifFormats.length > 0 && supportedImageFormats.length > 0,
        partial: supportedAudioFormats.length === 0 || supportedGifFormats.length === 0 || supportedImageFormats.length === 0,
        detail: `${supportedAudioFormats.length} audio format${supportedAudioFormats.length === 1 ? '' : 's'}, ${supportedGifFormats.length} animated GIF encoder, and ${supportedImageFormats.length} still-image format${supportedImageFormats.length === 1 ? '' : 's'} detected.`
      },
      {
        title: 'Canvas Capture',
        ok: hasCanvasCapture,
        detail: hasCanvasCapture ? 'Preview canvas can be captured for export.' : 'Preview canvas capture is missing.'
      },
      {
        title: 'Audio Engine',
        ok: audioContextSupported,
        detail: audioContextSupported ? 'Timeline audio graph is available.' : 'Browser audio graph support is missing.'
      },
      {
        title: 'Media Element Capture',
        ok: mediaElementCapture,
        partial: !mediaElementCapture,
        detail: mediaElementCapture ? 'Direct media element capture is present.' : 'Some browser-dependent media capture behavior may be limited.'
      },
    ];
  }

  function renderStartupCompatibilityPanel() {
    if (!els.startupCompatGrid) return;
    const report = getStartupCompatibilityReport();
    els.startupCompatGrid.innerHTML = '';
    for (const item of report) {
      const stateMeta = compatibilityStateLabel(item.ok, item.partial);
      const card = document.createElement('div');
      card.className = 'compat-card';
      card.innerHTML = `<h4>${item.title}</h4><div class="compat-pill ${stateMeta.cls}">${stateMeta.label}</div><div class="status">${item.detail}</div>`;
      els.startupCompatGrid.appendChild(card);
    }
  }

  function shouldShowCompatibilityOnStartup() {
    try {
      return localStorage.getItem(COMPATIBILITY_STARTUP_STORAGE_KEY) !== 'false';
    } catch (error) {
      console.warn('Could not read the compatibility-window preference.', error);
      return true;
    }
  }

  function updateCompatibilityPreferenceUi() {
    const showOnStartup = shouldShowCompatibilityOnStartup();
    if (els.showCompatibilityOnStartup) els.showCompatibilityOnStartup.checked = showOnStartup;
    if (els.dontShowCompatibilityAgain) els.dontShowCompatibilityAgain.checked = !showOnStartup;
    if (els.compatibilityPreferenceStatus) {
      els.compatibilityPreferenceStatus.textContent = showOnStartup
        ? 'The compatibility window will open automatically when SanityVideo starts.'
        : 'Automatic compatibility popups are off. Use “Open Compatibility Window” whenever you need it.';
    }
  }

  function setCompatibilityStartupPreference(showOnStartup) {
    try {
      localStorage.setItem(COMPATIBILITY_STARTUP_STORAGE_KEY, showOnStartup ? 'true' : 'false');
    } catch (error) {
      console.warn('Could not save the compatibility-window preference.', error);
    }
    updateCompatibilityPreferenceUi();
  }

  let startupReturnToSettings = false;

  function openStartupPanel({ returnToSettings = false } = {}) {
    startupReturnToSettings = !!returnToSettings;
    renderStartupCompatibilityPanel();
    updateCompatibilityPreferenceUi();
    if (els.startupOverlay) els.startupOverlay.hidden = false;
    requestAnimationFrame(() => els.closeStartupPanelBtn?.focus({ preventScroll: true }));
  }

  function closeStartupPanel() {
    if (els.startupOverlay) els.startupOverlay.hidden = true;
    const reopenSettings = startupReturnToSettings;
    startupReturnToSettings = false;
    if (reopenSettings) {
      openUiSettings(isMobileLayout() ? els.mobileSettingsBtn : els.uiSettingsBtn);
    }
  }


  function getFullscreenElement() {
    return document.fullscreenElement || document.webkitFullscreenElement || null;
  }

  function updatePreviewFullscreenButton() {
    if (!els.previewShell) return;
    const active = getFullscreenElement() === els.previewShell || !!state.mobileFullscreenFallback;
    els.previewShell.classList.toggle('is-fullscreen', active);
    if (els.previewFullscreenBtn) {
      els.previewFullscreenBtn.textContent = active ? '✕ Exit Full Screen' : '⛶ Full Screen';
      els.previewFullscreenBtn.setAttribute('aria-pressed', active ? 'true' : 'false');
      els.previewFullscreenBtn.title = active ? 'Exit full screen' : 'Enter full screen';
    }
    if (els.mobileFullscreenExitBtn) {
      els.mobileFullscreenExitBtn.hidden = !active;
      els.mobileFullscreenExitBtn.setAttribute('aria-hidden', active ? 'false' : 'true');
    }
  }

  function isPreviewFullscreenActive() {
    return getFullscreenElement() === els.previewShell || !!state.mobileFullscreenFallback;
  }

  function clearFullscreenControlsHideTimer() {
    if (state.fullscreenControlsHideTimer) clearTimeout(state.fullscreenControlsHideTimer);
    state.fullscreenControlsHideTimer = null;
  }

  function setFullscreenControlsVisible(visible) {
    if (!els.previewShell || !els.previewFullscreenControls) return;
    const shouldShow = !!visible && isPreviewFullscreenActive();
    els.previewShell.classList.toggle('fullscreen-controls-visible', shouldShow);
    els.previewFullscreenControls.setAttribute('aria-hidden', shouldShow ? 'false' : 'true');
  }

  function scheduleFullscreenControlsHide() {
    clearFullscreenControlsHideTimer();
    if (!isPreviewFullscreenActive() || state.fullscreenScrubbing) return;
    state.fullscreenControlsHideTimer = setTimeout(() => {
      if (!state.fullscreenScrubbing) setFullscreenControlsVisible(false);
    }, 3000);
  }

  function pokeFullscreenControls() {
    if (!isPreviewFullscreenActive()) return;
    setFullscreenControlsVisible(true);
    scheduleFullscreenControlsHide();
  }

  function syncFullscreenControls() {
    if (els.fullscreenScrubber) {
      els.fullscreenScrubber.max = Math.max(0.01, state.duration).toFixed(2);
      els.fullscreenScrubber.value = clamp(state.currentTime, 0, Math.max(state.duration, 0)).toFixed(2);
    }
    if (els.fullscreenTimeDisplay) els.fullscreenTimeDisplay.textContent = `${formatTime(state.currentTime)} / ${formatTime(state.duration)}`;
  }

  function setCurrentTime(value) {
    state.currentTime = clamp(Number(value) || 0, 0, state.duration);
    const previousForceSync = state.forceMediaSync;
    state.forceMediaSync = true;
    try { syncAudioVideo(); }
    finally { state.forceMediaSync = previousForceSync; }
    drawPreview();
    renderPlayhead();
    queuePausedPreviewRefresh();
    syncFullscreenControls();
  }

  async function togglePreviewFullscreen() {
    if (!els.previewShell) return;
    const active = getFullscreenElement() === els.previewShell || !!state.mobileFullscreenFallback;
    try {
      if (active) {
        if (state.mobileFullscreenFallback) {
          state.mobileFullscreenFallback = false;
          els.previewShell.classList.remove('mobile-fullscreen-fallback');
        } else if (document.exitFullscreen) await document.exitFullscreen();
        else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
      } else {
        if (els.previewShell.requestFullscreen) await els.previewShell.requestFullscreen();
        else if (els.previewShell.webkitRequestFullscreen) els.previewShell.webkitRequestFullscreen();
        else {
          state.mobileFullscreenFallback = true;
          els.previewShell.classList.add('mobile-fullscreen-fallback');
          pokeFullscreenControls();
        }
      }
    } catch (err) {
      console.error(err);
      if (!active && els.previewShell) {
        state.mobileFullscreenFallback = true;
        els.previewShell.classList.add('mobile-fullscreen-fallback');
        pokeFullscreenControls();
        setStatus('Using mobile full-screen mode.');
      } else {
        setStatus('Full screen was blocked by the browser.');
      }
    }
    updatePreviewFullscreenButton();
  }


  function updateViewportSideBanners() {
    const viewerPane = els.viewerPane;
    const previewShell = els.previewShell;
    if (!viewerPane || !previewShell) return;
    const leftBanner = viewerPane.querySelector('.viewport-side-banner.left');
    const rightBanner = viewerPane.querySelector('.viewport-side-banner.right');
    if (!leftBanner || !rightBanner) return;

    const paneRect = viewerPane.getBoundingClientRect();
    const shellRect = previewShell.getBoundingClientRect();
    const horizontalGap = Math.max(0, Math.floor((shellRect.left - paneRect.left) - 16));
    const verticalGap = Math.max(0, Math.floor((paneRect.height - shellRect.height) / 2) - 16);
    const bannerWidth = Math.max(0, horizontalGap);
    const showBanners = bannerWidth >= 36 && verticalGap >= 0;

    viewerPane.classList.toggle('banner-hidden', !showBanners);
    leftBanner.style.width = bannerWidth + 'px';
    rightBanner.style.width = bannerWidth + 'px';
  }

  function formatTime(t) {
    const minutes = Math.floor(t / 60);
    const seconds = t % 60;
    return String(minutes).padStart(2, '0') + ':' + seconds.toFixed(1).padStart(4, '0');
  }
  function escapeHtml(str) {
    return String(str).replace(/[&<>\"]/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[s]));
  }
  const IMPORT_VIDEO_EXTENSIONS = new Set(['mp4', 'mov', 'm4v', 'webm', 'ogv', 'mpeg', 'mpg', '3gp', '3g2', 'avi', 'mkv', 'mts', 'm2ts']);
  const IMPORT_AUDIO_EXTENSIONS = new Set(['mp3', 'mp2', 'mpga', 'mpeg3', 'm4a', 'aac', 'adts', 'wav', 'wave', 'ogg', 'oga', 'opus', 'weba', 'flac', 'aif', 'aiff', 'aifc', 'caf', 'amr', '3ga']);
  const IMPORT_IMAGE_EXTENSIONS = new Set(['gif', 'png', 'jpg', 'jpeg', 'jfif', 'webp', 'bmp', 'svg', 'avif', 'heic', 'heif']);
  const IMPORT_TEXT_EXTENSIONS = new Set(['txt']);
  const IMPORT_MIME_BY_EXTENSION = Object.freeze({
    mp3: 'audio/mpeg', mp2: 'audio/mpeg', mpga: 'audio/mpeg', mpeg3: 'audio/mpeg',
    m4a: 'audio/mp4', aac: 'audio/aac', adts: 'audio/aac', wav: 'audio/wav', wave: 'audio/wav',
    ogg: 'audio/ogg', oga: 'audio/ogg', opus: 'audio/ogg', weba: 'audio/webm', flac: 'audio/flac',
    aif: 'audio/aiff', aiff: 'audio/aiff', aifc: 'audio/aiff', caf: 'audio/x-caf', amr: 'audio/amr', '3ga': 'audio/3gpp',
    mp4: 'video/mp4', mov: 'video/quicktime', m4v: 'video/x-m4v', webm: 'video/webm', ogv: 'video/ogg',
    mpeg: 'video/mpeg', mpg: 'video/mpeg', '3gp': 'video/3gpp', '3g2': 'video/3gpp2', avi: 'video/x-msvideo',
    mkv: 'video/x-matroska', mts: 'video/mp2t', m2ts: 'video/mp2t',
    gif: 'image/gif', png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', jfif: 'image/jpeg',
    webp: 'image/webp', bmp: 'image/bmp', svg: 'image/svg+xml', avif: 'image/avif', heic: 'image/heic', heif: 'image/heif',
    txt: 'text/plain'
  });
  const GENERIC_IMPORT_MIME_TYPES = new Set(['', 'application/octet-stream', 'binary/octet-stream', 'application/unknown', 'application/x-download']);
  const IOS_LIKE_DEVICE = /iP(?:hone|ad|od)/i.test(navigator.userAgent || '') || (navigator.platform === 'MacIntel' && Number(navigator.maxTouchPoints) > 1);

  function fileExtension(fileName = '') {
    const safeName = String(fileName || '').toLowerCase().split(/[?#]/, 1)[0];
    const dot = safeName.lastIndexOf('.');
    return dot >= 0 ? safeName.slice(dot + 1) : '';
  }

  function mediaKindFromType(type, fileName = '') {
    const safeType = String(type || '').toLowerCase().split(';', 1)[0].trim();
    const extension = fileExtension(fileName);
    if (safeType.startsWith('audio/')) return 'audio';
    if (safeType.startsWith('video/')) return 'video';
    if (safeType.startsWith('image/')) return 'image';
    if (safeType.startsWith('text/')) return 'text';

    // Mobile document providers often return no MIME type, a generic binary
    // MIME type, or a provider-specific value. The file extension is therefore
    // the authoritative fallback for import classification.
    if (IMPORT_AUDIO_EXTENSIONS.has(extension)) return 'audio';
    if (IMPORT_IMAGE_EXTENSIONS.has(extension)) return 'image';
    if (IMPORT_TEXT_EXTENSIONS.has(extension)) return 'text';
    if (IMPORT_VIDEO_EXTENSIONS.has(extension)) return 'video';
    return null;
  }

  function inferredImportMime(file, kind) {
    const declared = String(file?.type || '').toLowerCase().split(';', 1)[0].trim();
    const extension = fileExtension(file?.name || '');
    const inferred = IMPORT_MIME_BY_EXTENSION[extension] || '';
    const declaredMatchesKind = declared && declared.startsWith(kind + '/');
    if (!GENERIC_IMPORT_MIME_TYPES.has(declared) && declaredMatchesKind) return declared;
    return inferred || (declaredMatchesKind ? declared : '') || ({ audio: 'audio/mpeg', video: 'video/mp4', image: 'image/png', text: 'text/plain' }[kind] || 'application/octet-stream');
  }

  function normalizeImportFile(file, kind) {
    const mimeType = inferredImportMime(file, kind);
    const currentType = String(file?.type || '').toLowerCase().split(';', 1)[0].trim();
    if (currentType === mimeType && !GENERIC_IMPORT_MIME_TYPES.has(currentType)) return { blob: file, mimeType, materialized: false };
    try {
      // Retag without changing the original file-provider handle. This is the
      // cheapest path and remains the desktop/Android default.
      if (typeof file?.slice === 'function') {
        return { blob: file.slice(0, Number(file.size) || undefined, mimeType), mimeType, materialized: false };
      }
    } catch (err) {}
    return { blob: new Blob([file], { type: mimeType }), mimeType, materialized: true };
  }

  function canMaterializeImportFile(file) {
    return !!file && (typeof file.arrayBuffer === 'function' || typeof FileReader !== 'undefined');
  }

  function readImportFileBytes(file) {
    if (typeof file?.arrayBuffer === 'function') return file.arrayBuffer();
    return new Promise((resolve, reject) => {
      if (typeof FileReader === 'undefined') {
        reject(new Error('This browser cannot read the selected file bytes.'));
        return;
      }
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(reader.error || new Error('The selected file could not be read.'));
      reader.onabort = () => reject(new Error('The selected file read was cancelled.'));
      reader.readAsArrayBuffer(file);
    });
  }

  async function prepareImportBlob(file, kind, forceMaterialize = false) {
    const normalized = normalizeImportFile(file, kind);
    const shouldMaterialize = forceMaterialize || (IOS_LIKE_DEVICE && kind === 'audio');
    if (!shouldMaterialize || !canMaterializeImportFile(file)) return normalized;
    try {
      // Reading the bytes before creating the object URL forces iCloud Drive and
      // other iPhone document providers to finish delivering the selected file.
      // Without this, Safari can return from Open with a lazy file handle that
      // never produces media metadata.
      const bytes = await readImportFileBytes(file);
      if (!bytes || (!bytes.byteLength && Number(file.size) > 0)) throw new Error('The selected file returned no readable data.');
      return { blob: new Blob([bytes], { type: normalized.mimeType }), mimeType: normalized.mimeType, materialized: true };
    } catch (err) {
      if (forceMaterialize) throw err;
      console.warn('Could not pre-read the iPhone file; trying the provider handle directly.', err);
      return normalized;
    }
  }

  function getMediaElementHost() {
    let host = document.getElementById('sanityMediaElementHost');
    if (host) return host;
    host = document.createElement('div');
    host.id = 'sanityMediaElementHost';
    host.setAttribute('aria-hidden', 'true');
    Object.assign(host.style, {
      position: 'fixed', left: '-10000px', top: '0', width: '2px', height: '2px',
      overflow: 'hidden', opacity: '0.001', pointerEvents: 'none', zIndex: '-1'
    });
    document.body.appendChild(host);
    return host;
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
    if (layerId && getLayerById(layerId)) {
      state.selectedLayerId = layerId;
      // Keep the hidden desktop upload selector synchronized with the layer
      // selected from a clip tap. Mobile imports used to read the stale
      // selector value and could therefore land on a different layer.
      if (els.uploadLayer) els.uploadLayer.value = layerId;
    }
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
    clip.invert = !!clip.invert;
    clip.trimStart = Math.max(0, Number(clip.trimStart) || 0);
    return clip;
  }

  function createHistorySnapshot() {
    const project = serializeProject();
    for (let layerIndex = 0; layerIndex < project.layers.length; layerIndex++) {
      const projectLayer = project.layers[layerIndex];
      const liveLayer = state.layers[layerIndex];
      for (let clipIndex = 0; clipIndex < projectLayer.clips.length; clipIndex++) {
        const projectClip = projectLayer.clips[clipIndex];
        const liveClip = liveLayer?.clips?.[clipIndex];
        if (liveClip?.sourceFile instanceof Blob) projectClip.sourceFile = liveClip.sourceFile;
      }
    }
    return {
      project,
      selectedClipIds: [...(state.selectedClipIds || [])],
      selectedClipId: state.selectedClipId || null,
      selectedLayerId: state.selectedLayerId || null,
      currentTime: state.currentTime,
    };
  }

  function cancelPendingHistory() {
    if (state.pendingHistoryTimer) clearTimeout(state.pendingHistoryTimer);
    state.pendingHistoryTimer = null;
    state.pendingHistoryLabel = '';
  }

  function flushPendingHistory() {
    if (!state.pendingHistoryTimer) return;
    cancelPendingHistory();
    pushHistory('Control edit');
  }

  function scheduleHistoryPush(label = 'Control edit', delay = 120) {
    if (state.historyRestoring) return;
    state.pendingHistoryLabel = label || 'Control edit';
    if (state.pendingHistoryTimer) clearTimeout(state.pendingHistoryTimer);
    state.pendingHistoryTimer = setTimeout(() => {
      const nextLabel = state.pendingHistoryLabel || label || 'Control edit';
      state.pendingHistoryTimer = null;
      state.pendingHistoryLabel = '';
      pushHistory(nextLabel);
    }, delay);
  }

  async function restoreHistorySnapshot(snapshot) {
    if (!snapshot || state.historyRestoring) return;
    cancelPendingHistory();
    state.historyRestoring = true;
    try {
      await loadProjectFromObject(snapshot.project, { skipHistoryReset: true });
      state.selectedClipIds = Array.isArray(snapshot.selectedClipIds) ? snapshot.selectedClipIds.filter(Boolean) : [];
      state.selectedClipId = snapshot.selectedClipId || state.selectedClipIds[0] || null;
      state.selectedLayerId = snapshot.selectedLayerId || state.selectedLayerId;
      state.currentTime = Number.isFinite(Number(snapshot.currentTime)) ? Number(snapshot.currentTime) : state.currentTime;
      ensureSelectedClipState();
      renderAll();
    requestAnimationFrame(updateViewportSideBanners);
    } finally {
      state.historyRestoring = false;
      updateUndoRedoButtons();
    }
  }

  function pushHistory(label = '') {
    if (state.historyRestoring) return;
    cancelPendingHistory();
    const snapshot = createHistorySnapshot();
    const current = state.history[state.historyIndex];
    if (current && JSON.stringify(current) === JSON.stringify(snapshot)) {
      updateUndoRedoButtons();
      return;
    }
    state.history = state.history.slice(0, state.historyIndex + 1);
    state.history.push(snapshot);
    if (state.history.length > 120) state.history.shift();
    state.historyIndex = state.history.length - 1;
    updateUndoRedoButtons();
  }

  async function undoHistory() {
    if (state.historyRestoring) return;
    flushPendingHistory();
    if (state.historyIndex <= 0) return;
    state.historyIndex -= 1;
    updateUndoRedoButtons();
    await restoreHistorySnapshot(state.history[state.historyIndex]);
    setStatus('Undo applied.');
  }

  async function redoHistory() {
    if (state.historyRestoring) return;
    flushPendingHistory();
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
    updateMobileTransportUi();
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
    const scheduleCommit = () => scheduleHistoryPush('Control edit', 120);
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

  function setClipPlaybackRate(clip, playbackRate) {
    if (!clip) return;
    ensureClipDefaults(clip);
    const previousRate = getClipPlaybackRate(clip);
    const previousDuration = Math.max(0.3, Number(clip.duration) || 0.3);
    clip.playbackRate = Math.max(0.25, Number(playbackRate) || 1);
    if (clip.kind === 'video' || clip.kind === 'audio') {
      const playableMedia = Math.max(0.3, (Number(clip.mediaDuration) || 0.3) - clip.trimStart);
      const visibleMediaSpan = clamp(previousDuration * previousRate, 0.3, playableMedia);
      clip.duration = roundToTenth(clamp(visibleMediaSpan / clip.playbackRate, 0.3, playableMedia / clip.playbackRate));
    }
    normalizeClipTiming(clip);
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

  function normalizeEffect(effect) {
    const type = effect?.type || 'blur';
    const normalized = {
      ...(effect || {}),
      id: effect?.id || uid('fx'),
      type,
      value: Number.isFinite(Number(effect?.value)) ? Number(effect.value) : defaultEffectValue(type)
    };
    if (type === 'opacity') {
      normalized.colorToAlphaEnabled = !!effect?.colorToAlphaEnabled;
      normalized.colorToAlphaColor = typeof effect?.colorToAlphaColor === 'string' ? effect.colorToAlphaColor : '#00ff00';
      normalized.colorToAlphaTolerance = clamp(Number.isFinite(Number(effect?.colorToAlphaTolerance)) ? Number(effect.colorToAlphaTolerance) : 36, 0, 255);
      normalized.colorToAlphaSoftness = clamp(Number.isFinite(Number(effect?.colorToAlphaSoftness)) ? Number(effect.colorToAlphaSoftness) : 20, 0, 255);
    }
    if (type === 'grayscale') {
      normalized.selectiveEnabled = !!effect?.selectiveEnabled;
      normalized.selectiveMode = String(effect?.selectiveMode || 'replace').toLowerCase() === 'mask' ? 'mask' : 'replace';
      normalized.selectiveColor = typeof effect?.selectiveColor === 'string' ? effect.selectiveColor : '#ff0000';
      normalized.selectiveTolerance = clamp(Number.isFinite(Number(effect?.selectiveTolerance)) ? Number(effect.selectiveTolerance) : 54, 0, 255);
      normalized.selectiveSoftness = clamp(Number.isFinite(Number(effect?.selectiveSoftness)) ? Number(effect.selectiveSoftness) : 28, 0, 255);
    }
    return normalized;
  }

  function ensureEffectsArray(clip) {
    if (!Array.isArray(clip.effects)) clip.effects = [];
    clip.effects = clip.effects.map(normalizeEffect);
    return clip.effects;
  }

  function defaultEffectValue(type) {
    return ({ blur: 6, grayscale: 100, sepia: 100, saturate: 125, opacity: 100, shadow: 70, pixelate: 12 })[type] ?? 100;
  }

  function effectValueBounds(type) {
    return {
      blur: { min: 0, max: 30, step: 1, suffix: 'px' },
      grayscale: { min: 0, max: 100, step: 1, suffix: '%' },
      sepia: { min: 0, max: 100, step: 1, suffix: '%' },
      saturate: { min: 0, max: 300, step: 1, suffix: '%' },
      opacity: { min: 0, max: 100, step: 1, suffix: '%' },
      shadow: { min: 0, max: 100, step: 1, suffix: '%' },
      pixelate: { min: 1, max: 80, step: 1, suffix: 'px' },
    }[type] || { min: 0, max: 100, step: 1, suffix: '%' };
  }

  function effectAppliesToClip(effect, clip) {
    if (!clip) return false;
    if (effect.type === 'shadow') return clip.kind === 'text';
    if (effect.type === 'pixelate') return clip.kind === 'image' || clip.kind === 'video';
    return isVisualClip(clip);
  }

  function buildEffectsFilter(clip) {
    const pieces = [];
    if (clip?.invert) pieces.push('invert(100%)');
    for (const effect of ensureEffectsArray(clip)) {
      if (!effectAppliesToClip(effect, clip)) continue;
      if (effect.type === 'blur' && effect.value > 0) pieces.push(`blur(${(effect.value * getRenderPixelScale()).toFixed(2)}px)`);
      if (effect.type === 'grayscale' && effect.value > 0 && !effect.selectiveEnabled) pieces.push(`grayscale(${effect.value}%)`);
      if (effect.type === 'sepia' && effect.value > 0) pieces.push(`sepia(${effect.value}%)`);
      if (effect.type === 'saturate' && effect.value !== 100) pieces.push(`saturate(${effect.value}%)`);
    }
    return pieces.join(' ');
  }

  function getPixelateEffectValue(clip) {
    let amount = 1;
    for (const effect of ensureEffectsArray(clip)) {
      if (effect.type !== 'pixelate' || !effectAppliesToClip(effect, clip)) continue;
      amount = Math.max(amount, clamp(Number(effect.value) || 1, 1, 80));
    }
    return amount * getRenderPixelScale();
  }


  function getSelectiveGrayscaleState(clip) {
    let selective = null;
    for (const effect of ensureEffectsArray(clip)) {
      if (effect.type !== 'grayscale' || !effectAppliesToClip(effect, clip) || !effect.selectiveEnabled || !(Number(effect.value) > 0)) continue;
      selective = {
        amount: clamp(Number(effect.value) || 0, 0, 100),
        mode: String(effect.selectiveMode || 'replace').toLowerCase() === 'mask' ? 'mask' : 'replace',
        color: effect.selectiveColor || '#ff0000',
        tolerance: clamp(Number(effect.selectiveTolerance) || 0, 0, 255),
        softness: clamp(Number(effect.selectiveSoftness) || 0, 0, 255),
      };
    }
    return selective;
  }

  function applySelectiveGrayscale(canvas, effectConfig) {
    if (!canvas || !effectConfig) return;
    const w = canvas.width | 0;
    const h = canvas.height | 0;
    if (!w || !h) return;
    const workCtx = canvas.getContext('2d', { willReadFrequently: true });
    const img = workCtx.getImageData(0, 0, w, h);
    const data = img.data;
    const key = parseHexColor(effectConfig.color);
    const tol = clamp(Number(effectConfig.tolerance) || 0, 0, 255);
    const soft = clamp(Number(effectConfig.softness) || 0, 0, 255);
    const amount = clamp((Number(effectConfig.amount) || 0) / 100, 0, 1);
    const fadeCutoff = tol + soft;
    const isMaskMode = String(effectConfig.mode || 'replace').toLowerCase() === 'mask';
    for (let i = 0; i < data.length; i += 4) {
      const a = data[i + 3];
      if (!a) continue;
      const dr = data[i] - key.r;
      const dg = data[i + 1] - key.g;
      const db = data[i + 2] - key.b;
      const distance = Math.sqrt(dr * dr + dg * dg + db * db);
      let match = 0;
      if (distance <= tol) match = 1;
      else if (distance < fadeCutoff && soft > 0) match = 1 - ((distance - tol) / Math.max(1, soft));
      const applyFactor = isMaskMode ? (1 - match) : match;
      if (applyFactor <= 0) continue;
      const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
      const blend = clamp(applyFactor * amount, 0, 1);
      data[i] = Math.round(data[i] + (gray - data[i]) * blend);
      data[i + 1] = Math.round(data[i + 1] + (gray - data[i + 1]) * blend);
      data[i + 2] = Math.round(data[i + 2] + (gray - data[i + 2]) * blend);
    }
    workCtx.putImageData(img, 0, 0);
  }

  function getOpacityEffectState(clip) {
    let opacity = 1;
    let colorToAlpha = null;
    for (const effect of ensureEffectsArray(clip)) {
      if (effect.type !== 'opacity' || !effectAppliesToClip(effect, clip)) continue;
      opacity *= clamp((Number(effect.value) || 100) / 100, 0, 1);
      if (effect.colorToAlphaEnabled) {
        colorToAlpha = {
          color: effect.colorToAlphaColor || '#00ff00',
          tolerance: clamp(Number(effect.colorToAlphaTolerance) || 0, 0, 255),
          softness: clamp(Number(effect.colorToAlphaSoftness) || 0, 0, 255),
        };
      }
    }
    return { opacity: clamp(opacity, 0, 1), colorToAlpha };
  }

  function getClipOpacityMultiplier(clip) {
    return getOpacityEffectState(clip).opacity;
  }

  function parseHexColor(hex) {
    const raw = String(hex || '').trim().replace('#', '');
    const normalized = raw.length === 3 ? raw.split('').map(ch => ch + ch).join('') : raw;
    if (!/^[0-9a-fA-F]{6}$/.test(normalized)) return { r: 0, g: 255, b: 0 };
    return {
      r: parseInt(normalized.slice(0, 2), 16),
      g: parseInt(normalized.slice(2, 4), 16),
      b: parseInt(normalized.slice(4, 6), 16),
    };
  }

  function applyColorToAlpha(canvas, effectConfig) {
    if (!canvas || !effectConfig) return;
    const w = canvas.width | 0;
    const h = canvas.height | 0;
    if (!w || !h) return;
    const workCtx = canvas.getContext('2d', { willReadFrequently: true });
    const img = workCtx.getImageData(0, 0, w, h);
    const data = img.data;
    const key = parseHexColor(effectConfig.color);
    const tol = clamp(Number(effectConfig.tolerance) || 0, 0, 255);
    const soft = clamp(Number(effectConfig.softness) || 0, 0, 255);
    const fullCutoff = tol;
    const fadeCutoff = tol + soft;
    for (let i = 0; i < data.length; i += 4) {
      const a = data[i + 3];
      if (!a) continue;
      const dr = data[i] - key.r;
      const dg = data[i + 1] - key.g;
      const db = data[i + 2] - key.b;
      const distance = Math.sqrt(dr * dr + dg * dg + db * db);
      let alphaScale = 1;
      if (distance <= fullCutoff) alphaScale = 0;
      else if (distance < fadeCutoff && soft > 0) alphaScale = (distance - fullCutoff) / Math.max(1, soft);
      data[i + 3] = Math.max(0, Math.min(255, Math.round(a * alphaScale)));
    }
    workCtx.putImageData(img, 0, 0);
  }

  const mediaFxCanvas = document.createElement('canvas');
  const mediaFxCtx = mediaFxCanvas.getContext('2d', { willReadFrequently: true });
  const mediaPixelCanvas = document.createElement('canvas');
  const mediaPixelCtx = mediaPixelCanvas.getContext('2d', { willReadFrequently: true });
  const transitionRenderCanvas = document.createElement('canvas');
  const transitionRenderCtx = transitionRenderCanvas.getContext('2d', { willReadFrequently: true });
  const transitionMaskCanvas = document.createElement('canvas');
  const transitionMaskCtx = transitionMaskCanvas.getContext('2d', { willReadFrequently: true });

  function ensureTransitionBufferSize(width, height) {
    const w = Math.max(1, Math.round(width));
    const h = Math.max(1, Math.round(height));
    if (transitionRenderCanvas.width !== w || transitionRenderCanvas.height !== h) {
      transitionRenderCanvas.width = w;
      transitionRenderCanvas.height = h;
    }
    if (transitionMaskCanvas.width !== w || transitionMaskCanvas.height !== h) {
      transitionMaskCanvas.width = w;
      transitionMaskCanvas.height = h;
    }
  }

  function applyPixelateToCanvas(canvas, blockSize) {
    const size = clamp(Number(blockSize) || 1, 1, 80);
    if (!canvas || size <= 1) return;
    const w = canvas.width | 0;
    const h = canvas.height | 0;
    if (!w || !h) return;
    const downW = Math.max(1, Math.round(w / size));
    const downH = Math.max(1, Math.round(h / size));
    if (mediaPixelCanvas.width !== downW || mediaPixelCanvas.height !== downH) {
      mediaPixelCanvas.width = downW;
      mediaPixelCanvas.height = downH;
    }
    mediaPixelCtx.save();
    mediaPixelCtx.imageSmoothingEnabled = false;
    mediaPixelCtx.clearRect(0, 0, downW, downH);
    mediaPixelCtx.drawImage(canvas, 0, 0, w, h, 0, 0, downW, downH);
    mediaPixelCtx.restore();
    const targetCtx = canvas.getContext('2d', { willReadFrequently: true });
    targetCtx.save();
    targetCtx.imageSmoothingEnabled = false;
    targetCtx.clearRect(0, 0, w, h);
    targetCtx.drawImage(mediaPixelCanvas, 0, 0, downW, downH, 0, 0, w, h);
    targetCtx.restore();
  }

  function drawMediaWithEffects(source, sw, sh, dw, dh, clip, targetCtx = ctx) {
    const opacityState = getOpacityEffectState(clip);
    const selectiveGrayscale = getSelectiveGrayscaleState(clip);
    const pixelateAmount = getPixelateEffectValue(clip);
    const combinedFilter = getCombinedCanvasFilter(clip) || 'none';
    const scrubRegions = clip?.scrubRegions || [];
    const needsOffscreenPass = !!opacityState.colorToAlpha || !!selectiveGrayscale || pixelateAmount > 1 || scrubRegions.length > 0;
    if (!needsOffscreenPass) {
      targetCtx.save();
      targetCtx.filter = combinedFilter;
      targetCtx.drawImage(source, -dw / 2, -dh / 2, dw, dh);
      targetCtx.restore();
      return;
    }
    const targetW = Math.max(1, Math.round(dw));
    const targetH = Math.max(1, Math.round(dh));
    if (mediaFxCanvas.width !== targetW || mediaFxCanvas.height !== targetH) {
      mediaFxCanvas.width = targetW;
      mediaFxCanvas.height = targetH;
    }
    mediaFxCtx.clearRect(0, 0, targetW, targetH);
    mediaFxCtx.filter = combinedFilter;
    mediaFxCtx.drawImage(source, 0, 0, sw, sh, 0, 0, targetW, targetH);
    mediaFxCtx.filter = 'none';
    if (selectiveGrayscale) applySelectiveGrayscale(mediaFxCanvas, selectiveGrayscale);
    if (pixelateAmount > 1) applyPixelateToCanvas(mediaFxCanvas, pixelateAmount);
    applyColorToAlpha(mediaFxCanvas, opacityState.colorToAlpha);
    if (scrubRegions.length) applyScrubRegionsToCanvas(mediaFxCanvas, scrubRegions);
    targetCtx.drawImage(mediaFxCanvas, -dw / 2, -dh / 2, dw, dh);
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
    clip.wipeEdgeFalloff = clamp(Number(clip.wipeEdgeFalloff) || 0, 0, 100);
    clip.wipeAngle = Number.isFinite(Number(clip.wipeAngle)) ? Number(clip.wipeAngle) : 0;
    if (els.wipeEdgeFalloff) els.wipeEdgeFalloff.value = String(Math.round(clip.wipeEdgeFalloff));
    if (els.wipeAngle) els.wipeAngle.value = String(Math.round(clip.wipeAngle));
  }

  async function generateWaveformForClip(clip) {
    if (!clip || clip.kind !== 'audio' || clip.waveformDataUrl || clip.waveformNativePreview || !clip.src || state.waveformJobs.get(clip)) return;

    // Creating a Web Audio context solely for waveform decoding can switch the
    // iPhone audio session into a lower-quality route. Keep imported audio on
    // Safari's native decoder and leave the timeline strip as its waveform cue.
    if (IOS_LIKE_DEVICE) {
      clip.waveformNativePreview = true;
      return;
    }

    const job = (async () => {
      let temporaryContext = null;
      try {
        const response = await fetch(clip.src);
        const arrayBuffer = await response.arrayBuffer();
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;
        const ac = state.audioContext || (temporaryContext = new AudioCtx());
        const buffer = await ac.decodeAudioData(arrayBuffer.slice(0));
        const channel = buffer.getChannelData(0);
        const bars = 96;
        const step = Math.max(1, Math.floor(channel.length / bars));
        const peaks = [];
        for (let i = 0; i < bars; i++) {
          let peak = 0;
          const sampleStart = i * step;
          const sampleEnd = Math.min(channel.length, sampleStart + step);
          for (let sample = sampleStart; sample < sampleEnd; sample++) peak = Math.max(peak, Math.abs(channel[sample] || 0));
          peaks.push(peak);
        }
        const canv = document.createElement('canvas');
        canv.width = 384;
        canv.height = 48;
        const c2 = canv.getContext('2d');
        c2.clearRect(0, 0, canv.width, canv.height);
        c2.fillStyle = 'rgba(255,255,255,0.88)';
        const mid = canv.height / 2;
        const barW = canv.width / peaks.length;
        peaks.forEach((peak, i) => {
          const h = Math.max(2, peak * (canv.height * 0.9));
          const x = i * barW + 0.5;
          c2.fillRect(x, mid - h / 2, Math.max(1, barW - 1), h);
        });
        clip.waveformDataUrl = canv.toDataURL('image/png');
        renderTracks();
      } catch (err) {
        console.warn('Waveform generation skipped', err);
      } finally {
        state.waveformJobs.delete(clip);
        if (temporaryContext && temporaryContext.state !== 'closed') {
          try { await temporaryContext.close(); } catch (err) {}
        }
      }
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
    if (els.canvas) els.canvas.classList.toggle('scrub-draw-active', active);
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

  function normalizeScrubRegion(region = {}) {
    return {
      x: clamp(Number(region.x) || 0, 0, 1),
      y: clamp(Number(region.y) || 0, 0, 1),
      w: clamp(Number(region.w) || 0.005, 0.005, 1),
      h: clamp(Number(region.h) || 0.005, 0.005, 1),
      mode: region.mode || 'pixelate',
      strength: Math.max(2, Number(region.strength) || 14),
    };
  }

  function applyScrubRegionsToCanvas(canvas, regions = []) {
    const w = canvas?.width | 0;
    const h = canvas?.height | 0;
    if (!w || !h || !regions.length) return;
    const targetCtx = canvas.getContext('2d', { willReadFrequently: true });
    for (const rawRegion of regions) {
      const region = normalizeScrubRegion(rawRegion);
      const sx = Math.round(region.x * w);
      const sy = Math.round(region.y * h);
      const sw = Math.max(1, Math.round(region.w * w));
      const sh = Math.max(1, Math.round(region.h * h));
      if (region.mode === 'black') {
        targetCtx.save();
        targetCtx.fillStyle = '#000';
        targetCtx.fillRect(sx, sy, sw, sh);
        targetCtx.restore();
        continue;
      }
      const off = document.createElement('canvas');
      off.width = sw;
      off.height = sh;
      const octx = off.getContext('2d', { willReadFrequently: true });
      const renderScale = getRenderPixelScale();
      if (region.mode === 'blur') {
        octx.filter = `blur(${Math.max(2, region.strength * 0.8 * renderScale)}px)`;
        octx.drawImage(canvas, sx, sy, sw, sh, 0, 0, sw, sh);
        targetCtx.drawImage(off, sx, sy, sw, sh);
      } else {
        const scaledStrength = Math.max(2, region.strength * renderScale);
        const downW = Math.max(1, Math.round(sw / scaledStrength));
        const downH = Math.max(1, Math.round(sh / scaledStrength));
        off.width = downW;
        off.height = downH;
        octx.imageSmoothingEnabled = false;
        octx.drawImage(canvas, sx, sy, sw, sh, 0, 0, downW, downH);
        targetCtx.save();
        targetCtx.imageSmoothingEnabled = false;
        targetCtx.drawImage(off, 0, 0, downW, downH, sx, sy, sw, sh);
        targetCtx.restore();
      }
    }
  }

  function getRenderedClipMetrics(clip, width, height) {
    const source = clip?.element;
    const sw = source?.videoWidth || source?.naturalWidth || source?.width || 0;
    const sh = source?.videoHeight || source?.naturalHeight || source?.height || 0;
    if (!sw || !sh) return null;
    const fitScale = Math.min(width / sw, height / sh);
    const baseDw = sw * fitScale;
    const baseDh = sh * fitScale;
    const c = ensureClipDefaults(clip || {});
    const clipScale = Math.max(0.1, Number(c.scale) || 1);
    return {
      sw,
      sh,
      dw: baseDw * clipScale,
      dh: baseDh * clipScale,
      cx: width / 2 + (Number(c.posX) || 0) * width,
      cy: height / 2 + (Number(c.posY) || 0) * height,
      rotation: (Number(c.rotation) || 0) * Math.PI / 180,
    };
  }

  function drawScrubRegionPreviewLocal(localCtx, region, dw, dh) {
    const r = normalizeScrubRegion(region);
    const sx = -dw / 2 + r.x * dw;
    const sy = -dh / 2 + r.y * dh;
    const sw = r.w * dw;
    const sh = r.h * dh;
    if (r.mode === 'black') {
      localCtx.fillStyle = 'rgba(0,0,0,0.88)';
      localCtx.fillRect(sx, sy, sw, sh);
    } else if (r.mode === 'blur') {
      localCtx.fillStyle = 'rgba(255,255,255,0.18)';
      localCtx.fillRect(sx, sy, sw, sh);
    } else {
      localCtx.fillStyle = 'rgba(255,255,255,0.12)';
      localCtx.fillRect(sx, sy, sw, sh);
      localCtx.beginPath();
      const step = Math.max(6, Math.min(sw, sh) / Math.max(3, r.strength * 0.35));
      for (let x = sx; x <= sx + sw; x += step) {
        localCtx.moveTo(x, sy);
        localCtx.lineTo(x, sy + sh);
      }
      for (let y = sy; y <= sy + sh; y += step) {
        localCtx.moveTo(sx, y);
        localCtx.lineTo(sx + sw, y);
      }
      localCtx.stroke();
    }
    localCtx.strokeRect(sx, sy, sw, sh);
  }

  function drawScrubRegionsOverlay(clip) {
    const metrics = getRenderedClipMetrics(clip, els.canvas.width, els.canvas.height);
    if (!metrics) return;
    ctx.save();
    ctx.translate(metrics.cx, metrics.cy);
    ctx.rotate(metrics.rotation);
    ctx.setLineDash([]);
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(255,255,255,0.9)';
    for (const region of clip.scrubRegions || []) drawScrubRegionPreviewLocal(ctx, region, metrics.dw, metrics.dh);
    ctx.restore();
  }

  function drawScrubDraft() {
    if (!state.scrubDraft) return;
    const info = getSelectedClipInfo();
    if (!info || !selectedClipSupportsScrub()) return;
    const metrics = getRenderedClipMetrics(info.clip, els.canvas.width, els.canvas.height);
    if (!metrics) return;
    ctx.save();
    ctx.translate(metrics.cx, metrics.cy);
    ctx.rotate(metrics.rotation);
    ctx.setLineDash([8, 6]);
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(255,255,255,0.95)';
    drawScrubRegionPreviewLocal(ctx, {
      ...state.scrubDraft,
      mode: els.scrubMode.value || 'pixelate',
      strength: Math.max(2, Number(els.scrubStrength.value) || 14),
    }, metrics.dw, metrics.dh);
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
      <button type="button" data-action="copy" data-requires-clip="true">Copy Selected Clip(s)</button>
      <button type="button" data-action="paste">Paste Copied Clip(s)</button>
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
      copy: menu.querySelector('[data-action="copy"]'),
      paste: menu.querySelector('[data-action="paste"]'),
      split: menu.querySelector('[data-action="split"]'),
      magnet: menu.querySelector('[data-action="magnet"]'),
      fit: menu.querySelector('[data-action="fit"]'),
      delete: menu.querySelector('[data-action="delete"]'),
    };
    menu.addEventListener('pointerdown', (e) => e.stopPropagation());
    menu.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-action]');
      if (!btn || btn.disabled) return;
      const action = btn.dataset.action;
      closeClipContextMenu();
      if (action === 'undo') undoHistory();
      else if (action === 'redo') redoHistory();
      else if (action === 'copy') copySelectedClips();
      else if (action === 'paste') pasteCopiedClips();
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
    window.addEventListener('pointerdown', closeOnPointer);
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
    const trackHeight = getTrackHeight();
    els.tracksArea.style.height = (state.layers.length * trackHeight) + 'px';

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
        const trackInset = isMobileLayout() ? 8 : 7;
        clipEl.style.top = (index * trackHeight + trackInset) + 'px';
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
        if (clip.kind === 'audio' && !clip.waveformDataUrl && !clip.waveformNativePreview) generateWaveformForClip(clip);
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

    clipEl.addEventListener('pointerdown', (e) => {
      if (!isPrimaryPointer(e)) return;
      e.stopPropagation();
      const additive = !!e.shiftKey || (isMobileLayout() && state.mobileMultiSelectMode);
      selectClip(clip.id, layer.id, additive);
    });
    clipEl.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (!isClipSelected(clip.id)) selectClip(clip.id, layer.id, false);
      else if (layer?.id) selectLayer(layer.id);
      openClipContextMenu(e.clientX, e.clientY);
    });

    body.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      if (!isPrimaryPointer(e)) return;
      if (e.cancelable) e.preventDefault();
      const additive = !!e.shiftKey || (isMobileLayout() && state.mobileMultiSelectMode);
      if (!isClipSelected(clip.id)) selectClip(clip.id, layer.id, additive);
      else if (!additive) selectClip(clip.id, layer.id, false);
      const selectedInfos = getSelectedClipInfos();
      if (!selectedInfos.length) return;
      const startX = e.clientX;
      const startY = e.clientY;
      let moved = false;
      const bases = selectedInfos.map(({ layer, clip }) => ({ clip, start: clip.start, layerIndex: state.layers.indexOf(layer) }));
      const anchorLayerIndex = bases[0].layerIndex;
      beginWindowPointerDrag(e, (ev) => {
        const dx = ev.clientX - startX;
        const dy = ev.clientY - startY;
        if (Math.abs(dx) + Math.abs(dy) > 3) moved = true;
        const deltaTime = dx / state.pxPerSecond;
        const trackHeight = getTrackHeight();
        const layerShift = clamp(Math.floor((anchorLayerIndex * trackHeight + dy) / trackHeight), 0, state.layers.length - 1) - anchorLayerIndex;
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
      }, () => {
        if (moved) pushHistory('Move clips');
      });
    });

    leftHandle.addEventListener('pointerdown', (e) => {
      if (!isPrimaryPointer(e)) return;
      e.stopPropagation();
      if (e.cancelable) e.preventDefault();
      const additive = !!e.shiftKey || (isMobileLayout() && state.mobileMultiSelectMode);
      if (!isClipSelected(clip.id)) selectClip(clip.id, layer.id, additive);
      const selectedInfos = getSelectedClipInfos();
      if (!selectedInfos.length) return;
      const startX = e.clientX;
      let moved = false;
      const bases = selectedInfos.map(({ clip }) => ({ clip, start: clip.start, duration: clip.duration, trimStart: Number(clip.trimStart) || 0 }));
      beginWindowPointerDrag(e, (ev) => {
        const delta = roundToTenth((ev.clientX - startX) / state.pxPerSecond);
        if (Math.abs(delta) > 0.001) moved = true;
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
      }, () => {
        if (moved) pushHistory('Trim clip start');
      });
    });

    rightHandle.addEventListener('pointerdown', (e) => {
      if (!isPrimaryPointer(e)) return;
      e.stopPropagation();
      if (e.cancelable) e.preventDefault();
      const additive = !!e.shiftKey || (isMobileLayout() && state.mobileMultiSelectMode);
      if (!isClipSelected(clip.id)) selectClip(clip.id, layer.id, additive);
      const selectedInfos = getSelectedClipInfos();
      if (!selectedInfos.length) return;
      const startX = e.clientX;
      let moved = false;
      const bases = selectedInfos.map(({ clip }) => ({ clip, duration: clip.duration }));
      beginWindowPointerDrag(e, (ev) => {
        const delta = roundToTenth((ev.clientX - startX) / state.pxPerSecond);
        if (Math.abs(delta) > 0.001) moved = true;
        for (const base of bases) {
          base.clip.duration = roundToTenth(Math.max(0.3, base.duration + delta));
          normalizeClipTiming(base.clip);
        }
        updateProjectDuration();
        renderTracks();
        renderSelection();
      }, () => {
        if (moved) pushHistory('Trim clip end');
      });
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
    } else {
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
      if (els.clipInvert) els.clipInvert.checked = !!clip.invert;
    }
    if (!allVisual && els.clipInvert) {
      els.clipInvert.checked = false;
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
      const opacityExtras = effect.type === 'opacity' ? `
        <div style="margin-top:10px; border-top:1px solid #273043; padding-top:10px;">
          <label style="display:flex; align-items:center; gap:8px;">
            <input type="checkbox" data-effect-color-alpha-toggle="${effect.id}" ${effect.colorToAlphaEnabled ? 'checked' : ''} />
            <span class="small">Color to alpha</span>
          </label>
          <div data-effect-color-alpha-fields="${effect.id}" style="display:${effect.colorToAlphaEnabled ? 'block' : 'none'}; margin-top:8px;">
            <label class="small">Key color</label>
            <input type="color" value="${escapeHtml(effect.colorToAlphaColor || '#00ff00')}" data-effect-color-alpha-color="${effect.id}" />
            <label class="small" style="margin-top:8px; display:block;">Tolerance</label>
            <input type="range" min="0" max="255" step="1" value="${Number(effect.colorToAlphaTolerance) || 0}" data-effect-color-alpha-tolerance="${effect.id}" />
            <div class="small" data-effect-color-alpha-tolerance-readout="${effect.id}">${Number(effect.colorToAlphaTolerance) || 0}</div>
            <label class="small" style="margin-top:8px; display:block;">Softness</label>
            <input type="range" min="0" max="255" step="1" value="${Number(effect.colorToAlphaSoftness) || 0}" data-effect-color-alpha-softness="${effect.id}" />
            <div class="small" data-effect-color-alpha-softness-readout="${effect.id}">${Number(effect.colorToAlphaSoftness) || 0}</div>
          </div>
        </div>
      ` : '';
      const grayscaleExtras = effect.type === 'grayscale' ? `
        <div style="margin-top:10px; border-top:1px solid #273043; padding-top:10px;">
          <label style="display:flex; align-items:center; gap:8px;">
            <input type="checkbox" data-effect-selective-grayscale-toggle="${effect.id}" ${effect.selectiveEnabled ? 'checked' : ''} />
            <span class="small">Selective grayscale</span>
          </label>
          <div data-effect-selective-grayscale-fields="${effect.id}" style="display:${effect.selectiveEnabled ? 'block' : 'none'}; margin-top:8px;">
            <label class="small">Mode</label>
            <select data-effect-selective-grayscale-mode="${effect.id}">
              <option value="replace" ${String(effect.selectiveMode || 'replace') === 'replace' ? 'selected' : ''}>Replace</option>
              <option value="mask" ${String(effect.selectiveMode || 'replace') === 'mask' ? 'selected' : ''}>Mask</option>
            </select>
            <label class="small" style="margin-top:8px; display:block;">Key color</label>
            <input type="color" value="${escapeHtml(effect.selectiveColor || '#ff0000')}" data-effect-selective-grayscale-color="${effect.id}" />
          </div>
        </div>
      ` : '';
      card.innerHTML = `
        <div class="effect-card-head">
          <strong>${escapeHtml(effect.type)}</strong>
          <button type="button" data-remove-effect="${effect.id}">Remove</button>
        </div>
        <label class="small">Amount</label>
        <input type="range" min="${bounds.min}" max="${bounds.max}" step="${bounds.step}" value="${effect.value}" data-effect-input="${effect.id}" />
        <div class="small" data-effect-readout="${effect.id}">${effect.value}${bounds.suffix}</div>
        ${opacityExtras}
        ${grayscaleExtras}
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
    host.querySelectorAll('[data-effect-color-alpha-toggle]').forEach(input => {
      input.addEventListener('input', () => {
        const id = input.getAttribute('data-effect-color-alpha-toggle');
        const enabled = !!input.checked;
        applyToSelectedClips((targetClip) => {
          const effect = ensureEffectsArray(targetClip).find(e => e.id === id) || ensureEffectsArray(targetClip)[indexOfEffectByType(targetClip, id)];
          if (effect && effect.type === 'opacity') effect.colorToAlphaEnabled = enabled;
        }, targetClip => ensureEffectsArray(targetClip).some(e => e.id === id || e.type === (sourceEffects.find(e => e.id === id)?.type)));
        const fields = host.querySelector(`[data-effect-color-alpha-fields="${id}"]`);
        if (fields) fields.style.display = enabled ? 'block' : 'none';
        drawPreview();
      });
      input.addEventListener('change', () => pushHistory('Edit effect'));
    });
    host.querySelectorAll('[data-effect-color-alpha-color]').forEach(input => {
      const applyColor = () => {
        const id = input.getAttribute('data-effect-color-alpha-color');
        const value = input.value || '#00ff00';
        applyToSelectedClips((targetClip) => {
          const effect = ensureEffectsArray(targetClip).find(e => e.id === id) || ensureEffectsArray(targetClip)[indexOfEffectByType(targetClip, id)];
          if (effect && effect.type === 'opacity') effect.colorToAlphaColor = value;
        }, targetClip => ensureEffectsArray(targetClip).some(e => e.id === id || e.type === (sourceEffects.find(e => e.id === id)?.type)));
        drawPreview();
      };
      input.addEventListener('input', applyColor);
      input.addEventListener('change', () => { applyColor(); pushHistory('Edit effect'); });
    });
    host.querySelectorAll('[data-effect-selective-grayscale-toggle]').forEach(input => {
      input.addEventListener('input', () => {
        const id = input.getAttribute('data-effect-selective-grayscale-toggle');
        const enabled = !!input.checked;
        applyToSelectedClips((targetClip) => {
          const effect = ensureEffectsArray(targetClip).find(e => e.id === id) || ensureEffectsArray(targetClip)[indexOfEffectByType(targetClip, id)];
          if (effect && effect.type === 'grayscale') effect.selectiveEnabled = enabled;
        }, targetClip => ensureEffectsArray(targetClip).some(e => e.id === id || e.type === (sourceEffects.find(e => e.id === id)?.type)));
        const fields = host.querySelector(`[data-effect-selective-grayscale-fields="${id}"]`);
        if (fields) fields.style.display = enabled ? 'block' : 'none';
        drawPreview();
      });
      input.addEventListener('change', () => pushHistory('Edit effect'));
    });
    host.querySelectorAll('[data-effect-selective-grayscale-mode]').forEach(input => {
      const applyMode = () => {
        const id = input.getAttribute('data-effect-selective-grayscale-mode');
        const value = String(input.value || 'replace').toLowerCase() === 'mask' ? 'mask' : 'replace';
        applyToSelectedClips((targetClip) => {
          const effect = ensureEffectsArray(targetClip).find(e => e.id === id) || ensureEffectsArray(targetClip)[indexOfEffectByType(targetClip, id)];
          if (effect && effect.type === 'grayscale') effect.selectiveMode = value;
        }, targetClip => ensureEffectsArray(targetClip).some(e => e.id === id || e.type === (sourceEffects.find(e => e.id === id)?.type)));
        drawPreview();
      };
      input.addEventListener('input', applyMode);
      input.addEventListener('change', () => { applyMode(); pushHistory('Edit effect'); });
    });
    host.querySelectorAll('[data-effect-selective-grayscale-color]').forEach(input => {
      const applyColor = () => {
        const id = input.getAttribute('data-effect-selective-grayscale-color');
        const value = input.value || '#ff0000';
        applyToSelectedClips((targetClip) => {
          const effect = ensureEffectsArray(targetClip).find(e => e.id === id) || ensureEffectsArray(targetClip)[indexOfEffectByType(targetClip, id)];
          if (effect && effect.type === 'grayscale') effect.selectiveColor = value;
        }, targetClip => ensureEffectsArray(targetClip).some(e => e.id === id || e.type === (sourceEffects.find(e => e.id === id)?.type)));
        drawPreview();
      };
      input.addEventListener('input', applyColor);
      input.addEventListener('change', () => { applyColor(); pushHistory('Edit effect'); });
    });

    host.querySelectorAll('[data-effect-color-alpha-tolerance], [data-effect-color-alpha-softness]').forEach(input => {
      let timer = null;
      const commit = () => {
        clearTimeout(timer);
        timer = setTimeout(() => { pushHistory('Edit effect'); timer = null; }, 120);
      };
      input.addEventListener('input', () => {
        const id = input.getAttribute('data-effect-color-alpha-tolerance') || input.getAttribute('data-effect-color-alpha-softness');
        const value = clamp(Number(input.value) || 0, 0, 255);
        const prop = input.hasAttribute('data-effect-color-alpha-tolerance') ? 'colorToAlphaTolerance' : 'colorToAlphaSoftness';
        applyToSelectedClips((targetClip) => {
          const effect = ensureEffectsArray(targetClip).find(e => e.id === id) || ensureEffectsArray(targetClip)[indexOfEffectByType(targetClip, id)];
          if (effect && effect.type === 'opacity') effect[prop] = value;
        }, targetClip => ensureEffectsArray(targetClip).some(e => e.id === id || e.type === (sourceEffects.find(e => e.id === id)?.type)));
        const readoutAttr = input.hasAttribute('data-effect-color-alpha-tolerance') ? 'data-effect-color-alpha-tolerance-readout' : 'data-effect-color-alpha-softness-readout';
        const readout = host.querySelector(`[${readoutAttr}="${id}"]`);
        if (readout) readout.textContent = String(value);
        drawPreview();
        commit();
      });
      input.addEventListener('change', commit);
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
    if (!(media instanceof HTMLMediaElement)) return false;
    if (state.mediaSourceMap.has(media)) return true;
    if (media.dataset.sanityAudioGraphUnavailable === '1') return false;
    const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextCtor) {
      media.dataset.sanityAudioGraphUnavailable = '1';
      return false;
    }
    try {
      if (!state.audioContext || state.audioContext.state === 'closed') {
        state.audioContext = new AudioContextCtor();
        try {
          state.audioDestination = typeof state.audioContext.createMediaStreamDestination === 'function'
            ? state.audioContext.createMediaStreamDestination()
            : null;
        } catch (err) {
          state.audioDestination = null;
        }
      }
      if (state.audioContext.state === 'suspended') {
        try { await state.audioContext.resume(); } catch (err) {}
      }
      const source = state.audioContext.createMediaElementSource(media);
      try { source.connect(state.audioContext.destination); } catch (err) {}
      if (state.audioDestination) {
        try { source.connect(state.audioDestination); } catch (err) {}
      }
      state.mediaSourceMap.set(media, source);
      return true;
    } catch (err) {
      // Direct HTMLMediaElement playback remains the reliable high-quality path
      // when WebKit refuses or degrades a blob-backed Web Audio source.
      media.dataset.sanityAudioGraphUnavailable = '1';
      console.warn('Web Audio routing is unavailable for this clip; using direct media playback.', err);
      return false;
    }
  }

  async function prepareAudioGraph(options = {}) {
    const force = !!options.force;
    for (const layer of state.layers) {
      for (const clip of layer.clips) {
        const media = clip.element;
        if (!(media instanceof HTMLMediaElement)) continue;
        // iPhone preview playback stays on Safari's native media decoder. Web
        // Audio is only engaged when export explicitly needs a capture stream.
        if (IOS_LIKE_DEVICE && !force) continue;
        if (IOS_LIKE_DEVICE && force) media.dataset.sanityIosForcedGraph = '1';
        await ensureAudioGraphFor(media);
      }
    }
  }

  function requestMediaPlay(media) {
    if (!(media instanceof HTMLMediaElement) || !media.paused) return;
    if (state.mediaPlayRequestMap.has(media)) return;
    const request = { cancelled: false };
    state.mediaPlayRequestMap.set(media, request);
    let playResult;
    try { playResult = media.play(); }
    catch (err) {
      state.mediaPlayRequestMap.delete(media);
      return;
    }
    Promise.resolve(playResult).catch(() => {}).finally(() => {
      if (state.mediaPlayRequestMap.get(media) === request) state.mediaPlayRequestMap.delete(media);
      if (request.cancelled) {
        try { media.pause(); } catch (err) {}
      }
    });
  }

  function pauseMedia(media) {
    if (!(media instanceof HTMLMediaElement)) return;
    const request = state.mediaPlayRequestMap.get(media);
    if (request) request.cancelled = true;
    state.mediaPlayRequestMap.delete(media);
    if (!media.paused) {
      try { media.pause(); } catch (err) {}
    }
  }

  function syncAudioVideo() {
    for (const layer of state.layers) {
      for (const clip of layer.clips) {
        const media = clip.element;
        if (!(media instanceof HTMLMediaElement)) continue;
        const playbackRate = getClipPlaybackRate(clip);
        const inRange = state.currentTime >= clip.start && state.currentTime <= clip.start + clip.duration;
        const shouldPlay = inRange && state.playing;
        const targetVolume = clamp((clip.volume ?? 1) * getClipFadeAlpha(clip, state.currentTime), 0, 1);
        if (Math.abs((Number(media.volume) || 0) - targetVolume) > 0.001) {
          try { media.volume = targetVolume; } catch (err) {}
        }
        if (Math.abs((Number(media.playbackRate) || 1) - playbackRate) > 0.001) {
          try { media.playbackRate = playbackRate; } catch (err) {}
        }
        if (inRange) {
          const desired = clamp((Number(clip.trimStart) || 0) + (state.currentTime - clip.start) * playbackRate, 0, Math.max(0, (clip.mediaDuration ?? clip.duration) - 0.03));
          const nativeIosPreview = IOS_LIKE_DEVICE && media.dataset.sanityNativePreview === '1' && !state.exporting;
          const tolerance = state.forceMediaSync ? (1 / 120) : state.playing ? (nativeIosPreview ? 0.75 : 0.25) : (1 / 30);
          if (Math.abs((media.currentTime || 0) - desired) > tolerance) {
            try { media.currentTime = desired; } catch (err) {}
          }
          if (shouldPlay) requestMediaPlay(media);
          else pauseMedia(media);
        } else {
          pauseMedia(media);
        }
      }
    }
  }

  async function restoreIosNativePreviewElements() {
    if (!IOS_LIKE_DEVICE) return;
    for (const layer of state.layers) {
      for (const clip of layer.clips) {
        const oldMedia = clip.element;
        if (!(oldMedia instanceof HTMLMediaElement) || oldMedia.dataset.sanityIosForcedGraph !== '1' || !clip.src) continue;
        try {
          const replacement = await createMediaElement(clip.kind, clip.src, clip.mimeType || '');
          const desired = clamp((Number(clip.trimStart) || 0) + Math.max(0, state.currentTime - clip.start) * getClipPlaybackRate(clip), 0, Math.max(0, (clip.mediaDuration ?? clip.duration) - 0.03));
          try { replacement.currentTime = desired; } catch (err) {}
          clip.element = replacement;
          pauseMedia(oldMedia);
          try { oldMedia.removeAttribute('src'); oldMedia.load(); } catch (err) {}
          try { oldMedia.remove(); } catch (err) {}
          state.mediaSourceMap.delete(oldMedia);
        } catch (err) {
          console.warn('Could not restore the native iPhone preview element after export.', err);
        }
      }
    }
  }


  function drawMediaFit(source, width, height, clip = null, targetCtx = ctx) {
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
    targetCtx.save();
    if (clip) targetCtx.globalAlpha *= getClipFadeAlpha(clip, state.currentTime) * getClipOpacityMultiplier(clip);
    targetCtx.translate(cx, cy);
    targetCtx.rotate((Number(c.rotation) || 0) * Math.PI / 180);
    if (clip && (clip.kind === 'video' || clip.kind === 'image')) drawMediaWithEffects(source, sw, sh, dw, dh, clip, targetCtx);
    else targetCtx.drawImage(source, -dw / 2, -dh / 2, dw, dh);
    targetCtx.restore();
  }


  function renderVisualClip(clip, width, height, overrideAlpha = 1, targetCtx = ctx) {
    if (!clip) return;
    if (clip.kind === 'image' || clip.kind === 'video') {
      targetCtx.save();
      targetCtx.globalAlpha *= overrideAlpha;
      drawMediaFit(clip.element, width, height, clip, targetCtx);
      targetCtx.restore();
    } else if (clip.kind === 'text') {
      const renderScale = getRenderPixelScale();
      const fontSize = Math.max(8, (Number(clip.fontSize) || 48) * renderScale);
      const c = ensureClipDefaults(clip);
      const anim = getTextAnimState(clip, state.currentTime);
      const selectiveGrayscale = getSelectiveGrayscaleState(clip);
      const alpha = overrideAlpha * getClipFadeAlpha(clip, state.currentTime) * getClipOpacityMultiplier(clip) * anim.alpha;
      const drawTextBlock = (drawCtx) => {
        drawCtx.textAlign = 'center';
        drawCtx.textBaseline = 'middle';
        drawCtx.filter = buildEffectsFilter(clip);
        drawCtx.font = `700 ${fontSize}px ${clip.fontFamily || 'Arial'}`;
        drawCtx.fillStyle = clip.color || '#ffffff';
        const shadow = getTextShadowStrength(clip);
        drawCtx.strokeStyle = `rgba(0,0,0,${0.85 * Math.max(0.25, shadow || 1)})`;
        drawCtx.lineJoin = 'round';
        drawCtx.lineWidth = Math.max(2, Math.floor(fontSize * 0.08));
        drawCtx.shadowColor = `rgba(0,0,0,${0.45 * shadow})`;
        drawCtx.shadowBlur = 18 * shadow * renderScale;
        const clipScale = Math.max(0.1, Number(c.scale) || 1) * anim.scale;
        drawCtx.translate(width / 2 + (Number(c.posX) || 0) * width, height * 0.82 + (Number(c.posY) || 0) * height - (anim.translateY * renderScale));
        drawCtx.rotate((Number(c.rotation) || 0) * Math.PI / 180);
        drawCtx.scale(clipScale, clipScale);
        const maxWidth = width * 0.84;
        const sourceText = clip.text || clip.label || 'Text';
        const animatedText = anim.chars == null ? sourceText : sourceText.slice(0, anim.chars);
        const lines = wrapTextLines(animatedText, maxWidth);
        const lineHeight = Math.round(fontSize * 1.15);
        const startY = -((lines.length - 1) * lineHeight / 2);
        for (let i = 0; i < lines.length; i++) {
          const y = startY + i * lineHeight;
          drawCtx.strokeText(lines[i], 0, y, maxWidth);
          drawCtx.fillText(lines[i], 0, y, maxWidth);
        }
      };
      if (!selectiveGrayscale) {
        targetCtx.save();
        targetCtx.globalAlpha = alpha;
        drawTextBlock(targetCtx);
        targetCtx.restore();
      } else {
        if (mediaFxCanvas.width !== width || mediaFxCanvas.height !== height) {
          mediaFxCanvas.width = width;
          mediaFxCanvas.height = height;
        }
        mediaFxCtx.clearRect(0, 0, width, height);
        mediaFxCtx.save();
        drawTextBlock(mediaFxCtx);
        mediaFxCtx.restore();
        mediaFxCtx.filter = 'none';
        applySelectiveGrayscale(mediaFxCanvas, selectiveGrayscale);
        targetCtx.save();
        targetCtx.globalAlpha = alpha;
        targetCtx.drawImage(mediaFxCanvas, 0, 0, width, height);
        targetCtx.restore();
      }
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
        if (clip.kind === 'image' || clip.kind === 'video') drawScrubRegionsOverlay(clip);
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
            0,
            width * nx,
            height * ny,
            (width * nx) + (height * ny),
          ];
          const minProj = Math.min(...corners);
          const maxProj = Math.max(...corners);
          const travel = Math.max(0.001, maxProj - minProj);
          const edgeProj = minProj + (travel * progress);
          const featherPx = Math.max(0.5, ((Number(clip.wipeEdgeFalloff) || 0) / 100) * Math.max(width, height) * 0.12);
          const startProj = edgeProj - featherPx;
          const endProj = edgeProj + featherPx;
          const gx0 = nx * startProj;
          const gy0 = ny * startProj;
          const gx1 = nx * endProj;
          const gy1 = ny * endProj;

          renderVisualClip(pair.fromClip, width, height, 1);
          ensureTransitionBufferSize(width, height);
          transitionRenderCtx.clearRect(0, 0, transitionRenderCanvas.width, transitionRenderCanvas.height);
          renderVisualClip(pair.toClip, width, height, 1, transitionRenderCtx);

          transitionMaskCtx.clearRect(0, 0, transitionMaskCanvas.width, transitionMaskCanvas.height);
          const maskGradient = transitionMaskCtx.createLinearGradient(gx0, gy0, gx1, gy1);
          maskGradient.addColorStop(0, 'rgba(255,255,255,1)');
          maskGradient.addColorStop(1, 'rgba(255,255,255,0)');
          transitionMaskCtx.fillStyle = maskGradient;
          transitionMaskCtx.fillRect(0, 0, width, height);

          transitionRenderCtx.save();
          transitionRenderCtx.globalCompositeOperation = 'destination-in';
          transitionRenderCtx.drawImage(transitionMaskCanvas, 0, 0);
          transitionRenderCtx.restore();
          ctx.drawImage(transitionRenderCanvas, 0, 0);
        } else {
          renderVisualClip(pair.fromClip, width, height, 1 - progress);
          renderVisualClip(pair.toClip, width, height, progress);
        }
      }
    }
    if (state.scrubDrawMode) drawScrubDraft();
    if (state.showPreviewTimeOverlay) {
      const renderScale = getRenderPixelScale();
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      ctx.font = `${Math.max(9, 14 * renderScale)}px Arial`;
      ctx.fillText(formatTime(state.currentTime), 12 * renderScale, height - (14 * renderScale));
    }
  }

  function renderPlayhead() {
    els.playhead.style.left = (state.currentTime * state.pxPerSecond) + 'px';
    els.timeDisplay.textContent = `${formatTime(state.currentTime)} / ${formatTime(state.duration)}`;
    updateMobileTransportUi();
    syncFullscreenControls();
  }



  function queuePausedPreviewRefresh() {
    if (state.playing) return;
    if (state.pendingPausedPreviewFrame) return;
    state.pendingPausedPreviewFrame = requestAnimationFrame(() => {
      state.pendingPausedPreviewFrame = 0;
      drawPreview();
      renderPlayhead();
    });
  }

  function frame(now) {
    if (!state.lastFrameTime) state.lastFrameTime = now;
    const dt = (now - state.lastFrameTime) / 1000;
    state.lastFrameTime = now;
    if (state.playing) {
      state.currentTime += dt;
      const playbackEnd = state.exporting && Number.isFinite(state.exportPlaybackEnd) ? state.exportPlaybackEnd : state.duration;
      if (state.currentTime > playbackEnd) {
        state.currentTime = playbackEnd;
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

  function getActiveImportLayerId() {
    if (state.selectedLayerId && getLayerById(state.selectedLayerId)) return state.selectedLayerId;
    const selectedClipInfo = getSelectedClipInfo();
    if (selectedClipInfo?.layer?.id) return selectedClipInfo.layer.id;
    if (els.uploadLayer?.value && getLayerById(els.uploadLayer.value)) return els.uploadLayer.value;
    return state.layers[0]?.id || null;
  }

  function updateUploadLayerSelect() {
    const current = getActiveImportLayerId();
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

  function createMediaElement(kind, url, mimeType = '') {
    return new Promise((resolve, reject) => {
      let settled = false;
      let timeoutId = null;
      let pollId = null;
      const finish = (fn, value) => {
        if (settled) return;
        settled = true;
        if (timeoutId) clearTimeout(timeoutId);
        if (pollId) clearInterval(pollId);
        fn(value);
      };
      const timeoutMs = IOS_LIKE_DEVICE ? 60000 : 30000;
      timeoutId = setTimeout(() => finish(reject, new Error('Timed out while reading media metadata.')), timeoutMs);
      if (kind === 'image') {
        const img = new Image();
        img.onload = () => finish(resolve, img);
        img.onerror = () => finish(reject, new Error('This image format could not be decoded by the browser.'));
        img.src = url;
      } else if (kind === 'video' || kind === 'audio') {
        const media = document.createElement(kind);
        media.preload = IOS_LIKE_DEVICE && kind === 'audio' ? 'auto' : 'metadata';
        media.playsInline = true;
        media.setAttribute('playsinline', '');
        media.setAttribute('webkit-playsinline', '');
        media.controls = false;
        media.autoplay = false;
        media.tabIndex = -1;
        media.defaultPlaybackRate = 1;
        media.playbackRate = 1;
        try { media.preservesPitch = true; } catch (err) {}
        try { media.webkitPreservesPitch = true; } catch (err) {}
        try { media.disableRemotePlayback = true; } catch (err) {}
        if (IOS_LIKE_DEVICE) media.dataset.sanityNativePreview = '1';
        if (kind === 'video') {
          // crossOrigin on blob: URLs can prevent Safari from loading local media.
          if (/^https?:/i.test(url)) media.crossOrigin = 'anonymous';
          media.muted = false;
          media.defaultMuted = false;
          const refreshPausedPreview = () => {
            if (!state.playing) queuePausedPreviewRefresh();
          };
          media.addEventListener('loadeddata', refreshPausedPreview);
          media.addEventListener('seeked', refreshPausedPreview);
        }
        const ready = () => {
          if (media.readyState >= 1 || (Number.isFinite(Number(media.duration)) && Number(media.duration) > 0)) {
            finish(resolve, media);
          }
        };
        ['loadedmetadata', 'loadeddata', 'canplay', 'durationchange'].forEach(eventName => {
          media.addEventListener(eventName, ready, { once: eventName !== 'durationchange' });
        });
        media.addEventListener('error', () => {
          const detail = media.error?.message || `This ${kind} format could not be decoded by the browser.`;
          finish(reject, new Error(detail));
        }, { once: true });
        if (mimeType) media.dataset.importMime = mimeType;
        // Keeping the probe attached off-screen is important on iPhone Safari;
        // detached audio elements can remain at HAVE_NOTHING after Files closes.
        getMediaElementHost().appendChild(media);
        media.src = url;
        try { media.load(); } catch (err) {}
        pollId = setInterval(ready, 250);
        ready();
      } else {
        finish(reject, new Error('Unsupported media kind.'));
      }
    });
  }

  function getUsableMediaDuration(media, fallback = 5) {
    const duration = Number(media?.duration);
    return Number.isFinite(duration) && duration > 0 ? duration : fallback;
  }

  async function addMediaFiles(files, targetLayerId) {
    const layer = getLayerById(targetLayerId) || state.layers[0];
    const result = { added: 0, skipped: [], failed: [] };
    if (!layer) return result;
    let timelineOffset = 0;
    for (const file of files) {
      const declaredKind = mediaKindFromType(file.type || '', file.name || '');
      if (!declaredKind) {
        result.skipped.push(file.name || 'Unnamed file');
        continue;
      }
      const start = getImportStartTime(layer, timelineOffset);
      let objectUrl = '';
      try {
        let kind = declaredKind;
        let clip = null;
        if (kind === 'text') {
          clip = await createTextClipFromFile(file, layer, start);
        } else {
          let normalized = await prepareImportBlob(file, kind);
          objectUrl = URL.createObjectURL(normalized.blob);
          let media;
          try {
            media = await createMediaElement(kind, objectUrl, normalized.mimeType);
          } catch (firstError) {
            // One retry with a fully materialized byte copy covers lazy iCloud
            // handles and provider MIME bugs without duplicating large files on
            // platforms that already work.
            if (!normalized.materialized && canMaterializeImportFile(file)) {
              URL.revokeObjectURL(objectUrl);
              objectUrl = '';
              normalized = await prepareImportBlob(file, kind, true);
              objectUrl = URL.createObjectURL(normalized.blob);
              media = await createMediaElement(kind, objectUrl, normalized.mimeType);
            } else {
              throw firstError;
            }
          }

          // Audio-only WebM files can arrive from mobile storage as video/webm.
          // Rebuild them as a true audio element when no video dimensions exist.
          if (kind === 'video' && fileExtension(file.name) === 'webm' && media instanceof HTMLVideoElement && !media.videoWidth && !media.videoHeight) {
            kind = 'audio';
            media.pause();
            media.removeAttribute('src');
            try { media.load(); } catch (err) {}
            media = await createMediaElement('audio', objectUrl, 'audio/webm');
          }

          // Do not wrap a newly imported iPhone media element in Web Audio
          // until the user presses Play/Export. Creating the graph while the
          // Files picker is closing can fail or leave audio silent on iOS.
          if (media instanceof HTMLMediaElement && !IOS_LIKE_DEVICE) await ensureAudioGraphFor(media);
          const mediaDuration = (kind === 'video' || kind === 'audio') ? getUsableMediaDuration(media, 5) : DEFAULT_IMAGE_DURATION;
          clip = buildBaseClip(kind, file.name, start, kind === 'image' ? DEFAULT_IMAGE_DURATION : Math.max(0.3, mediaDuration), mediaDuration);
          clip.element = media;
          clip.src = objectUrl;
          clip.sourceFile = normalized.blob;
          clip.mimeType = normalized.mimeType;
          clip.fileName = file.name;
          if (media instanceof HTMLMediaElement) {
            media.addEventListener('durationchange', () => {
              const nextDuration = getUsableMediaDuration(media, clip.mediaDuration || clip.duration || 5);
              if (!Number.isFinite(nextDuration) || nextDuration <= 0) return;
              const oldMediaDuration = Number(clip.mediaDuration) || 0;
              clip.mediaDuration = roundToTenth(nextDuration);
              if (!oldMediaDuration || Math.abs((Number(clip.duration) || 0) - oldMediaDuration) < 0.15) {
                clip.duration = roundToTenth(Math.max(0.3, nextDuration));
              }
              renderAll();
            });
          }
        }
        layer.clips.push(clip);
        state.selectedLayerId = layer.id;
        state.selectedClipId = clip.id;
        state.selectedClipIds = [clip.id];
        timelineOffset = roundToTenth((clip.start + clip.duration + 0.2) - state.currentTime);
        result.added += 1;
      } catch (err) {
        if (objectUrl) URL.revokeObjectURL(objectUrl);
        console.error(`Failed to import ${file.name || 'file'}`, err);
        result.failed.push(file.name || 'Unnamed file');
      }
    }
    if (result.added) renderAll();
    return result;
  }

  async function duplicateClip(clip, options = {}) {
    let media = null;
    if (clip.kind !== 'text' && clip.kind !== 'transition') {
      media = await createMediaElement(clip.kind, clip.src);
      if (media instanceof HTMLMediaElement && !IOS_LIKE_DEVICE) await ensureAudioGraphFor(media);
    }
    const startOffset = Number.isFinite(Number(options.startOffset)) ? Number(options.startOffset) : 0.2;
    const labelSuffix = Object.prototype.hasOwnProperty.call(options, 'labelSuffix') ? String(options.labelSuffix) : ' Copy';
    const baseLabel = String(clip.label || clip.kind || 'Clip');
    return {
      ...clip,
      id: uid('clip'),
      label: labelSuffix ? baseLabel + labelSuffix : baseLabel,
      element: media,
      sourceFile: clip.sourceFile || null,
      start: roundToTenth((Number(clip.start) || 0) + startOffset),
      scrubRegions: cloneScrubRegions(clip.scrubRegions),
      effects: JSON.parse(JSON.stringify(ensureEffectsArray(clip))),
      fontFamily: clip.fontFamily || 'Arial',
      textAnimation: clip.textAnimation || 'none',
      waveformDataUrl: clip.waveformDataUrl || '',
      waveformNativePreview: !!clip.waveformNativePreview,
      transitionType: clip.transitionType || 'crossfade',
      fromClipId: clip.fromClipId || '',
      toClipId: clip.toClipId || '',
      wipeEdgeFalloff: clamp(Number(clip.wipeEdgeFalloff) || 0, 0, 100),
      wipeAngle: Number.isFinite(Number(clip.wipeAngle)) ? Number(clip.wipeAngle) : 0,
    };
  }

  async function copySelectedClips() {
    const infos = getSelectedClipInfos().sort((a, b) => (Number(a.clip.start) || 0) - (Number(b.clip.start) || 0));
    if (!infos.length) {
      setStatus('No clip selected to copy.');
      return false;
    }
    state.clipClipboard = infos.map(({ clip }) => JSON.parse(JSON.stringify({
      ...clip,
      element: null,
      audioNode: null,
    })));
    updateUndoRedoButtons();
    setStatus(infos.length > 1 ? 'Selected clips copied.' : 'Selected clip copied.');
    return true;
  }

  async function pasteCopiedClips() {
    const clipboard = Array.isArray(state.clipClipboard) ? state.clipClipboard : [];
    if (!clipboard.length) {
      setStatus('Nothing copied yet.');
      return false;
    }
    let targetLayer = getLayerById(state.selectedLayerId);
    if (!targetLayer) targetLayer = state.layers[0] || null;
    if (!targetLayer) {
      setStatus('No target layer available for paste.');
      return false;
    }
    const sourceStart = Math.min(...clipboard.map(clip => Number(clip.start) || 0));
    const pastedIds = [];
    for (const clipData of clipboard) {
      const clone = await duplicateClip(clipData, {
        startOffset: (state.currentTime - sourceStart),
        labelSuffix: ' Copy',
      });
      clone.start = roundToTenth(Math.max(0, Number(clone.start) || 0));
      targetLayer.clips.push(clone);
      pastedIds.push(clone.id);
    }
    targetLayer.clips.sort((a, b) => (Number(a.start) || 0) - (Number(b.start) || 0));
    state.selectedLayerId = targetLayer.id;
    state.selectedClipIds = pastedIds;
    state.selectedClipId = pastedIds[pastedIds.length - 1] || null;
    renderAll();
    pushHistory('Paste clip');
    setStatus(pastedIds.length > 1 ? 'Copied clips pasted at the playhead.' : 'Copied clip pasted at the playhead.');
    return true;
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
    setCurrentTime(contentX / state.pxPerSecond);
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
      version: 9,
      canvasPreset: els.canvasPreset.value,
      currentTime: state.currentTime,
      pxPerSecond: state.pxPerSecond,
      showPreviewTimeOverlay: !!state.showPreviewTimeOverlay,
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
        const clipUrl = (clipData.kind === 'text' || clipData.kind === 'transition')
          ? ''
          : ((clipData.sourceFile instanceof Blob) ? URL.createObjectURL(clipData.sourceFile) : (clipData.src || ''));
        const media = (clipData.kind === 'text' || clipData.kind === 'transition') ? null : await createMediaElement(clipData.kind, clipUrl);
        if (media instanceof HTMLMediaElement && !IOS_LIKE_DEVICE) await ensureAudioGraphFor(media);
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
          src: clipUrl || clipData.src || '',
          mimeType: clipData.mimeType || '',
          fileName: clipData.fileName || clipData.label || 'clip',
          sourceFile: clipData.sourceFile instanceof Blob ? clipData.sourceFile : null,
          scrubRegions: cloneScrubRegions(clipData.scrubRegions),
          effects: Array.isArray(clipData.effects) ? clipData.effects : [],
          waveformDataUrl: clipData.waveformDataUrl || '',
          transitionType: clipData.transitionType || 'crossfade',
          fromClipId: clipData.fromClipId || '',
          toClipId: clipData.toClipId || '',
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
    state.showPreviewTimeOverlay = project.showPreviewTimeOverlay !== false;
    if (els.togglePreviewTimeOverlay) els.togglePreviewTimeOverlay.checked = state.showPreviewTimeOverlay;
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

  const QUICKTIME_EXPORT_VALUE = 'video/quicktime';
  const M4A_EXPORT_VALUE = 'audio/m4a';
  const M4A_RECORDER_MIMES = [
    'audio/mp4;codecs=mp4a.40.2',
    'audio/mp4',
    'video/mp4;codecs=mp4a.40.2',
    'video/mp4',
  ];
  const QUICKTIME_NATIVE_MIMES = [
    'video/quicktime;codecs=avc1.42E01E,mp4a.40.2',
    'video/quicktime',
  ];
  const QUICKTIME_ISO_SOURCE_MIMES = [
    'video/mp4;codecs=avc1.42E01E,mp4a.40.2',
    'video/mp4',
  ];
  const VIDEO_EXPORT_FORMATS = [
    { value: QUICKTIME_EXPORT_VALUE, label: 'MOV — QuickTime Container (Browser Codec)', extension: 'mov', quickTime: true },
    { value: 'video/mp4;codecs=avc1.42E01E,mp4a.40.2', label: 'MP4 — H.264 / AAC', extension: 'mp4' },
    { value: 'video/mp4', label: 'MP4 — Browser Default', extension: 'mp4' },
    { value: 'video/webm;codecs=vp9,opus', label: 'WebM — VP9 / Opus', extension: 'webm' },
    { value: 'video/webm;codecs=vp8,opus', label: 'WebM — VP8 / Opus', extension: 'webm' },
    { value: 'video/webm', label: 'WebM — Browser Default', extension: 'webm' },
  ];
  const AUDIO_EXPORT_FORMATS = [
    { value: M4A_EXPORT_VALUE, label: 'M4A — Browser MP4 Audio', extension: 'm4a', m4a: true },
    { value: 'audio/wav', label: 'WAV — Uncompressed PCM', extension: 'wav', native: true },
    { value: 'audio/webm;codecs=opus', label: 'WebM Audio — Opus', extension: 'webm' },
    { value: 'audio/webm', label: 'WebM Audio — Browser Default', extension: 'webm' },
    { value: 'audio/ogg;codecs=opus', label: 'Ogg Audio — Opus', extension: 'ogg' },
  ];
  const GIF_EXPORT_FORMATS = [
    { value: 'image/gif', label: 'GIF — Animated', extension: 'gif', native: true },
  ];
  const IMAGE_EXPORT_FORMATS = [
    { value: 'image/png', label: 'PNG — Lossless', extension: 'png' },
    { value: 'image/jpeg', label: 'JPEG — Compressed', extension: 'jpg' },
    { value: 'image/webp', label: 'WebP — Compressed', extension: 'webp' },
  ];

  function recorderSupports(type) {
    if (!window.MediaRecorder || !type) return false;
    try { return MediaRecorder.isTypeSupported(type); } catch (err) { return false; }
  }

  function canvasSupportsImageType(type) {
    if (!els.canvas || typeof els.canvas.toDataURL !== 'function') return false;
    if (type === 'image/png') return true;
    try { return els.canvas.toDataURL(type).startsWith(`data:${type}`); } catch (err) { return false; }
  }

  function resolveQuickTimeRecorderMime() {
    return QUICKTIME_NATIVE_MIMES.find(recorderSupports)
      || QUICKTIME_ISO_SOURCE_MIMES.find(recorderSupports)
      || '';
  }

  function resolveM4aRecorderMime() {
    return M4A_RECORDER_MIMES.find(recorderSupports) || '';
  }

  function resolveRecorderMimeForExport(mode, requestedType) {
    if (mode === 'video' && requestedType === QUICKTIME_EXPORT_VALUE) return resolveQuickTimeRecorderMime();
    if (mode === 'audio' && requestedType === M4A_EXPORT_VALUE) return resolveM4aRecorderMime();
    return recorderSupports(requestedType) ? requestedType : '';
  }

  function getSupportedExportFormats(mode) {
    if (mode === 'audio') {
      const wavAvailable = !!(window.AudioContext || window.webkitAudioContext);
      return AUDIO_EXPORT_FORMATS.filter(item => item.value === 'audio/wav' ? wavAvailable : item.m4a ? !!resolveM4aRecorderMime() : recorderSupports(item.value));
    }
    if (mode === 'gif') {
      const ok = !!(els.canvas && els.canvas.getContext && window.Blob && window.Uint8Array);
      return ok ? GIF_EXPORT_FORMATS.slice() : [];
    }
    if (mode === 'frame') return IMAGE_EXPORT_FORMATS.filter(item => canvasSupportsImageType(item.value));
    return VIDEO_EXPORT_FORMATS.filter(item => item.quickTime ? !!resolveQuickTimeRecorderMime() : recorderSupports(item.value));
  }

  function getExportInfrastructureStatus(mode) {
    if (mode === 'gif') {
      const ok = !!(els.canvas && els.canvas.getContext && window.Blob && window.Uint8Array);
      return { ok, detail: ok ? 'Frame-by-frame GIF encoding is available.' : 'Animated GIF encoding is unavailable in this browser.' };
    }
    if (mode === 'frame') {
      const ok = !!(els.canvas && typeof els.canvas.toBlob === 'function');
      return { ok, detail: ok ? 'Canvas image encoding is available.' : 'Canvas image encoding is unavailable in this browser.' };
    }
    if (mode === 'audio') {
      const ok = !!(window.MediaRecorder && (window.AudioContext || window.webkitAudioContext));
      return { ok, detail: ok ? 'Browser audio recording is available.' : 'Browser audio recording support is unavailable.' };
    }
    const ok = !!(window.MediaRecorder && els.canvas && typeof els.canvas.captureStream === 'function');
    return { ok, detail: ok ? 'Canvas video recording is available.' : 'Canvas video recording support is unavailable.' };
  }

  function combinedExportMime() {
    return getSupportedExportFormats('video')[0]?.value || '';
  }

  function extensionForMime(type, mode = 'video') {
    const normalized = String(type || '').toLowerCase();
    const pools = mode === 'audio' ? AUDIO_EXPORT_FORMATS : mode === 'gif' ? GIF_EXPORT_FORMATS : mode === 'frame' ? IMAGE_EXPORT_FORMATS : VIDEO_EXPORT_FORMATS;
    const exact = pools.find(item => item.value === type)?.extension;
    if (exact) return exact;
    if (normalized.includes('quicktime') || normalized.includes('mov')) return 'mov';
    if (normalized.includes('wav')) return 'wav';
    if (normalized.includes('gif')) return 'gif';
    if (type === M4A_EXPORT_VALUE || normalized.includes('m4a') || normalized.includes('mp4')) return mode === 'audio' ? 'm4a' : 'mp4';
    if (normalized.includes('ogg')) return 'ogg';
    if (normalized.includes('jpeg')) return 'jpg';
    if (normalized.includes('webp')) return 'webp';
    if (normalized.includes('png')) return 'png';
    if (mode === 'gif') return 'gif';
    return mode === 'frame' ? 'png' : mode === 'audio' ? 'wav' : 'webm';
  }

  function normalizeExportBaseName(value) {
    const raw = String(value || 'sanityvideo_export').trim().replace(/\.[a-z0-9]{2,5}$/i, '');
    return sanitizeEmbeddedFileName(raw || 'sanityvideo_export', 'sanityvideo_export').slice(0, 120);
  }

  function applyToSelectedClips(mutator, predicate = null) {
    const infos = getSelectedClipInfos();
    for (const { clip } of infos) {
      if (!predicate || predicate(clip)) mutator(clip);
    }
  }

  function resetSelectedVideoControl(control) {
    const defaults = {
      exposure: 0,
      brightness: 100,
      contrast: 100,
      hue: 0,
      playbackRate: 1,
    };
    if (!Object.prototype.hasOwnProperty.call(defaults, control)) return;
    applyToSelectedClips((clip) => {
      if (control === 'playbackRate') setClipPlaybackRate(clip, defaults[control]);
      else clip[control] = defaults[control];
    }, clip => clip.kind === 'video');
    if (control === 'playbackRate') {
      updateProjectDuration();
      renderTracks();
      syncAudioVideo();
    }
    renderSelection();
    drawPreview();
    pushHistory('Reset clip control');
  }

  function getSelectedExportRange() {
    const infos = getSelectedClipInfos();
    if (!infos.length) return null;
    const start = Math.min(...infos.map(info => Number(info.clip.start) || 0));
    const end = Math.max(...infos.map(info => (Number(info.clip.start) || 0) + (Number(info.clip.duration) || 0)));
    return end > start ? { start, end } : null;
  }

  function getExportRange() {
    const mode = els.exportRange?.value || 'full';
    if (mode === 'selected') {
      const selected = getSelectedExportRange();
      if (!selected) throw new Error('Select one or more timeline clips before exporting the selected range.');
      return selected;
    }
    if (mode === 'custom') {
      const start = clamp(Number(els.exportStart?.value) || 0, 0, Math.max(0, state.duration));
      const end = clamp(Number(els.exportEnd?.value) || 0, 0, Math.max(0, state.duration));
      if (!(end > start)) throw new Error('Custom export end must be later than its start.');
      return { start, end };
    }
    return { start: 0, end: Math.max(0.01, state.duration) };
  }

  function getExportDimensions() {
    const preset = els.exportResolution?.value || 'project';
    if (preset === 'project') return { width: els.canvas.width, height: els.canvas.height };
    if (preset === 'custom') {
      const width = Math.round(clamp(Number(els.exportWidth?.value) || els.canvas.width, 64, 7680) / 2) * 2;
      const height = Math.round(clamp(Number(els.exportHeight?.value) || els.canvas.height, 64, 4320) / 2) * 2;
      return { width, height };
    }
    const [width, height] = preset.split('x').map(Number);
    return { width, height };
  }


  function getGifDimensions() {
    const preset = els.exportGifResolution?.value || '640x360';
    if (preset === 'project') return { width: els.canvas.width, height: els.canvas.height };
    if (preset === 'custom') {
      return {
        width: Math.round(clamp(Number(els.exportGifWidth?.value) || 640, 64, 1920)),
        height: Math.round(clamp(Number(els.exportGifHeight?.value) || 360, 64, 1920)),
      };
    }
    const [width, height] = preset.split('x').map(Number);
    return { width, height };
  }

  function updateExportProgress(progress, text) {
    if (els.exportProgressWrap) els.exportProgressWrap.hidden = false;
    if (els.exportProgress) els.exportProgress.value = clamp(Number(progress) || 0, 0, 1);
    if (els.exportProgressText) els.exportProgressText.textContent = text || 'Exporting…';
  }

  function setExportBusy(busy) {
    if (els.startExportBtn) els.startExportBtn.disabled = busy;
    if (els.closeExportBtn) els.closeExportBtn.disabled = busy;
    if (els.cancelExportBtn) els.cancelExportBtn.disabled = busy;
    if (els.stopExportBtn) els.stopExportBtn.hidden = !busy;
    for (const control of els.exportOverlay?.querySelectorAll('input, select') || []) control.disabled = busy;
  }

  function populateExportFormats() {
    if (!els.exportFormat) return;
    const mode = els.exportMode?.value || 'video';
    const previous = els.exportFormat.value;
    const formats = getSupportedExportFormats(mode);
    const infrastructure = getExportInfrastructureStatus(mode);
    els.exportFormat.innerHTML = '';
    for (const item of formats) {
      const option = document.createElement('option');
      option.value = item.value;
      option.textContent = item.label;
      els.exportFormat.appendChild(option);
    }
    if (formats.some(item => item.value === previous)) els.exportFormat.value = previous;
    const modeLabel = mode === 'video' ? 'video recording' : mode === 'gif' ? 'animated GIF encoding' : mode === 'audio' ? 'audio export' : 'still-image encoding';
    if (els.exportCapability) {
      const unavailable = formats.length === 0 || !infrastructure.ok;
      els.exportCapability.classList.toggle('warn', unavailable);
      const selectedIsMov = mode === 'video' && els.exportFormat?.value === QUICKTIME_EXPORT_VALUE;
      const selectedIsM4a = mode === 'audio' && els.exportFormat?.value === M4A_EXPORT_VALUE;
      els.exportCapability.textContent = unavailable
        ? `${infrastructure.detail}${formats.length ? '' : ` No supported ${modeLabel} format was detected.`}`
        : selectedIsMov
          ? 'MOV is available. SanityVideo records the browser-supported ISO media stream and finalizes it with a genuine QuickTime qt container brand; the video/audio codec is selected by the browser.'
          : selectedIsM4a
            ? 'M4A is available. SanityVideo records the browser-supported MP4 audio stream and finalizes the file with M4A container branding. AAC is used when the browser exposes it.'
            : `${formats.length} supported ${modeLabel} format${formats.length === 1 ? '' : 's'} detected. Formats not supported by this browser are intentionally hidden.`;
    }
    if (els.startExportBtn) els.startExportBtn.disabled = formats.length === 0 || !infrastructure.ok;
  }

  function updateExportUi() {
    const mode = els.exportMode?.value || 'video';
    const isWav = mode === 'audio' && els.exportFormat?.value === 'audio/wav';
    els.exportVideoOptions?.classList.toggle('export-mode-hidden', mode !== 'video');
    els.exportGifOptions?.classList.toggle('export-mode-hidden', mode !== 'gif');
    els.exportAudioOptions?.classList.toggle('export-mode-hidden', mode !== 'audio');
    els.exportRangeOptions?.classList.toggle('export-mode-hidden', mode === 'frame');
    els.exportImageOptions?.classList.toggle('export-mode-hidden', mode !== 'frame');
    els.exportCustomResolution?.classList.toggle('export-mode-hidden', els.exportResolution?.value !== 'custom');
    els.exportGifCustomResolution?.classList.toggle('export-mode-hidden', els.exportGifResolution?.value !== 'custom');
    els.exportCustomRange?.classList.toggle('export-mode-hidden', els.exportRange?.value !== 'custom');
    els.exportCompressedAudioQuality?.classList.toggle('export-mode-hidden', mode === 'audio' && isWav);
    els.exportWavSampleRateField?.classList.toggle('export-mode-hidden', !isWav);
    els.exportWavBitDepthField?.classList.toggle('export-mode-hidden', !isWav);
    els.exportWavChannelsField?.classList.toggle('export-mode-hidden', !isWav);
    if (els.exportIncludeTimeOverlay && mode === 'video') els.exportIncludeTimeOverlay.checked = !!state.showPreviewTimeOverlay;
    populateExportFormats();
    for (const button of els.exportModeShortcuts || []) {
      button.setAttribute('aria-pressed', button.dataset.exportModeShortcut === mode ? 'true' : 'false');
    }
    const nowWav = mode === 'audio' && els.exportFormat?.value === 'audio/wav';
    els.exportCompressedAudioQuality?.classList.toggle('export-mode-hidden', nowWav);
    els.exportWavSampleRateField?.classList.toggle('export-mode-hidden', !nowWav);
    els.exportWavBitDepthField?.classList.toggle('export-mode-hidden', !nowWav);
    els.exportWavChannelsField?.classList.toggle('export-mode-hidden', !nowWav);
  }

  function openExportDialog() {
    if (!els.exportOverlay || state.exporting) return;
    if (els.exportEnd) els.exportEnd.value = Math.max(0.01, state.duration).toFixed(2);
    if (els.exportWidth) els.exportWidth.value = els.canvas.width;
    if (els.exportHeight) els.exportHeight.value = els.canvas.height;
    if (els.exportIncludeTimeOverlay) els.exportIncludeTimeOverlay.checked = !!state.showPreviewTimeOverlay;
    if (els.exportProgressWrap) els.exportProgressWrap.hidden = true;
    updateExportUi();
    els.exportOverlay.hidden = false;
    requestAnimationFrame(() => els.exportMode?.focus({ preventScroll: true }));
  }

  function closeExportDialog(force = false) {
    if (state.exporting && !force) return;
    if (els.exportOverlay) els.exportOverlay.hidden = true;
    if (els.exportProgressWrap) els.exportProgressWrap.hidden = true;
    els.exportBtn?.focus({ preventScroll: true });
  }

  function readUint32BE(bytes, offset) {
    return ((bytes[offset] << 24) >>> 0) + (bytes[offset + 1] << 16) + (bytes[offset + 2] << 8) + bytes[offset + 3];
  }

  function writeAscii4(bytes, offset, value) {
    const padded = String(value || '').padEnd(4, ' ').slice(0, 4);
    for (let i = 0; i < 4; i++) bytes[offset + i] = padded.charCodeAt(i) & 255;
  }

  function findIsoBox(bytes, wantedType, maxScan = 1048576) {
    let offset = 0;
    const limit = Math.min(bytes.length, maxScan);
    while (offset + 8 <= limit) {
      let size = readUint32BE(bytes, offset);
      const type = String.fromCharCode(bytes[offset + 4], bytes[offset + 5], bytes[offset + 6], bytes[offset + 7]);
      let headerSize = 8;
      if (size === 1 && offset + 16 <= limit) {
        const high = readUint32BE(bytes, offset + 8);
        const low = readUint32BE(bytes, offset + 12);
        if (high !== 0) return null;
        size = low;
        headerSize = 16;
      } else if (size === 0) {
        size = bytes.length - offset;
      }
      if (type === wantedType) return { offset, size, headerSize };
      if (!Number.isFinite(size) || size < headerSize) break;
      offset += size;
    }
    return null;
  }

  async function finalizeQuickTimeMov(blob, sourceMime) {
    const bytes = new Uint8Array(await blob.arrayBuffer());
    const ftyp = findIsoBox(bytes, 'ftyp');
    const sourceWasQuickTime = String(sourceMime || '').toLowerCase().includes('quicktime');
    if (!ftyp || ftyp.size < ftyp.headerSize + 8) {
      if (sourceWasQuickTime) return new Blob([bytes], { type: QUICKTIME_EXPORT_VALUE });
      throw new Error('The browser produced video data that could not be finalized as a QuickTime MOV container.');
    }
    const payload = ftyp.offset + ftyp.headerSize;
    writeAscii4(bytes, payload, 'qt  ');
    if (ftyp.size >= ftyp.headerSize + 12) writeAscii4(bytes, payload + 8, 'qt  ');
    return new Blob([bytes], { type: QUICKTIME_EXPORT_VALUE });
  }

  async function finalizeM4a(blob, sourceMime) {
    const bytes = new Uint8Array(await blob.arrayBuffer());
    const ftyp = findIsoBox(bytes, 'ftyp');
    if (!ftyp || ftyp.size < ftyp.headerSize + 8) {
      throw new Error('The browser produced audio data that could not be finalized as an M4A container.');
    }
    const payload = ftyp.offset + ftyp.headerSize;
    writeAscii4(bytes, payload, 'M4A ');
    if (ftyp.size >= ftyp.headerSize + 12) writeAscii4(bytes, payload + 8, 'M4A ');
    return new Blob([bytes], { type: 'audio/mp4' });
  }

  function createMediaRecorder(stream, mimeType, options = {}) {
    const preferred = { mimeType, ...options };
    try { return new MediaRecorder(stream, preferred); }
    catch (firstError) {
      try { return new MediaRecorder(stream, { mimeType }); }
      catch (secondError) { return new MediaRecorder(stream); }
    }
  }


  function littleEndianWord(value) {
    return [value & 255, (value >>> 8) & 255];
  }

  function littleEndianDword(value) {
    return [value & 255, (value >>> 8) & 255, (value >>> 16) & 255, (value >>> 24) & 255];
  }

  function asciiBytes(text) {
    return Uint8Array.from([...String(text)].map(char => char.charCodeAt(0) & 255));
  }

  function createUniformGifPalette(colorCount) {
    const count = [32, 64, 128, 256].includes(Number(colorCount)) ? Number(colorCount) : 256;
    const bits = Math.round(Math.log2(count));
    const channelBits = bits === 8 ? [3, 3, 2] : bits === 7 ? [3, 2, 2] : bits === 6 ? [2, 2, 2] : [2, 2, 1];
    const [rBits, gBits, bBits] = channelBits;
    const rLevels = 1 << rBits;
    const gLevels = 1 << gBits;
    const bLevels = 1 << bBits;
    const palette = new Uint8Array(count * 3);
    for (let index = 0; index < count; index++) {
      const bi = index & (bLevels - 1);
      const gi = (index >>> bBits) & (gLevels - 1);
      const ri = (index >>> (bBits + gBits)) & (rLevels - 1);
      palette[index * 3] = Math.round(ri * 255 / Math.max(1, rLevels - 1));
      palette[index * 3 + 1] = Math.round(gi * 255 / Math.max(1, gLevels - 1));
      palette[index * 3 + 2] = Math.round(bi * 255 / Math.max(1, bLevels - 1));
    }
    return { palette, bits, rBits, gBits, bBits, rLevels, gLevels, bLevels };
  }

  function mapRgbaToGifIndexes(rgba, width, height, paletteInfo, dither) {
    const output = new Uint8Array(width * height);
    const { rBits, gBits, bBits, rLevels, gLevels, bLevels } = paletteInfo;
    const matrix = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
    const rStep = 255 / Math.max(1, rLevels - 1);
    const gStep = 255 / Math.max(1, gLevels - 1);
    const bStep = 255 / Math.max(1, bLevels - 1);
    let sourceIndex = 0;
    let outputIndex = 0;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++, sourceIndex += 4, outputIndex++) {
        const threshold = dither ? ((matrix[(y & 3) * 4 + (x & 3)] - 7.5) / 16) : 0;
        const r = clamp(rgba[sourceIndex] + threshold * rStep, 0, 255);
        const g = clamp(rgba[sourceIndex + 1] + threshold * gStep, 0, 255);
        const b = clamp(rgba[sourceIndex + 2] + threshold * bStep, 0, 255);
        const ri = Math.round(r * (rLevels - 1) / 255);
        const gi = Math.round(g * (gLevels - 1) / 255);
        const bi = Math.round(b * (bLevels - 1) / 255);
        output[outputIndex] = (ri << (gBits + bBits)) | (gi << bBits) | bi;
      }
    }
    return output;
  }

  function gifLzwEncode(indexes, minimumCodeSize) {
    if (!indexes?.length) return new Uint8Array([0]);
    const clearCode = 1 << minimumCodeSize;
    const endCode = clearCode + 1;
    let nextCode = endCode + 1;
    let codeSize = minimumCodeSize + 1;
    let dictionary = new Map();
    const bytes = [];
    let currentByte = 0;
    let bitCount = 0;

    const writeCode = (code) => {
      currentByte |= code << bitCount;
      bitCount += codeSize;
      while (bitCount >= 8) {
        bytes.push(currentByte & 255);
        currentByte >>>= 8;
        bitCount -= 8;
      }
    };
    const resetDictionary = () => {
      dictionary = new Map();
      nextCode = endCode + 1;
      codeSize = minimumCodeSize + 1;
    };

    writeCode(clearCode);
    let prefix = indexes[0];
    for (let i = 1; i < indexes.length; i++) {
      const suffix = indexes[i];
      const key = prefix * 256 + suffix;
      const found = dictionary.get(key);
      if (found !== undefined) {
        prefix = found;
        continue;
      }
      writeCode(prefix);
      if (nextCode < 4096) {
        dictionary.set(key, nextCode++);
        // The decoder creates its first dictionary entry one emitted code later
        // than the encoder, so the width transition must occur after, not at,
        // the nominal boundary. This avoids the classic GIF LZW off-by-one bug.
        if (nextCode > (1 << codeSize) && codeSize < 12) codeSize++;
      } else {
        writeCode(clearCode);
        resetDictionary();
      }
      prefix = suffix;
    }
    writeCode(prefix);
    writeCode(endCode);
    if (bitCount > 0) bytes.push(currentByte & 255);

    const blocks = [];
    for (let offset = 0; offset < bytes.length; offset += 255) {
      const length = Math.min(255, bytes.length - offset);
      blocks.push(length, ...bytes.slice(offset, offset + length));
    }
    blocks.push(0);
    return Uint8Array.from(blocks);
  }

  class SimpleGifEncoder {
    constructor(width, height, paletteInfo, loop) {
      this.width = width;
      this.height = height;
      this.paletteInfo = paletteInfo;
      this.loop = loop;
      this.parts = [];
      this.started = false;
    }
    start() {
      if (this.started) return;
      this.started = true;
      const tableBits = this.paletteInfo.bits;
      const packed = 0x80 | ((tableBits - 1) << 4) | (tableBits - 1);
      this.parts.push(asciiBytes('GIF89a'));
      this.parts.push(Uint8Array.from([
        ...littleEndianWord(this.width), ...littleEndianWord(this.height), packed, 0, 0,
      ]));
      this.parts.push(this.paletteInfo.palette);
      if (this.loop) {
        this.parts.push(Uint8Array.from([
          0x21, 0xFF, 0x0B,
          ...asciiBytes('NETSCAPE2.0'),
          0x03, 0x01, 0x00, 0x00, 0x00,
        ]));
      }
    }
    addFrame(indexes, delayHundredths) {
      this.start();
      const delay = clamp(Math.round(delayHundredths), 1, 65535);
      this.parts.push(Uint8Array.from([
        0x21, 0xF9, 0x04, 0x04, ...littleEndianWord(delay), 0x00, 0x00,
        0x2C, 0x00, 0x00, 0x00, 0x00, ...littleEndianWord(this.width), ...littleEndianWord(this.height), 0x00,
        Math.max(2, this.paletteInfo.bits),
      ]));
      this.parts.push(gifLzwEncode(indexes, Math.max(2, this.paletteInfo.bits)));
    }
    finish() {
      this.start();
      this.parts.push(Uint8Array.from([0x3B]));
      return new Blob(this.parts, { type: 'image/gif' });
    }
  }

  function waitForMediaEvent(media, eventName, timeoutMs = 800) {
    return new Promise(resolve => {
      let done = false;
      const finish = () => {
        if (done) return;
        done = true;
        clearTimeout(timer);
        media.removeEventListener(eventName, finish);
        media.removeEventListener('error', finish);
        resolve();
      };
      const timer = setTimeout(finish, timeoutMs);
      media.addEventListener(eventName, finish, { once: true });
      media.addEventListener('error', finish, { once: true });
    });
  }

  async function seekVisualMediaForExport(time) {
    state.currentTime = time;
    state.playing = false;
    const waits = [];
    for (const layer of state.layers) {
      if (!layer.visible) continue;
      for (const clip of layer.clips) {
        const media = clip.element;
        if (!(media instanceof HTMLVideoElement)) continue;
        const active = time >= clip.start && time <= clip.start + clip.duration;
        if (!active) continue;
        const desired = clamp((Number(clip.trimStart) || 0) + (time - clip.start) * getClipPlaybackRate(clip), 0, Math.max(0, (clip.mediaDuration ?? clip.duration) - 0.03));
        if (Math.abs((media.currentTime || 0) - desired) > 0.015) {
          const wait = waitForMediaEvent(media, 'seeked');
          try { media.currentTime = desired; } catch (err) {}
          waits.push(wait);
        } else if (media.readyState < 2) {
          waits.push(waitForMediaEvent(media, 'loadeddata'));
        }
      }
    }
    await Promise.all(waits);
    drawPreview();
  }

  async function exportAnimatedGif() {
    const range = getExportRange();
    const duration = range.end - range.start;
    if (!(duration > 0)) throw new Error('The GIF export range is empty.');
    const { width, height } = getGifDimensions();
    const fps = clamp(Number(els.exportGifFps?.value) || 10, 1, 20);
    const frameCount = Math.max(1, Math.ceil(duration * fps));
    if (frameCount > 1800 && !confirm(`This GIF contains ${frameCount} frames and may be very large. Continue?`)) return;
    const colorCount = Number(els.exportGifColors?.value) || 256;
    const dither = !!els.exportGifDither?.checked;
    const loop = !!els.exportGifLoop?.checked;
    const paletteInfo = createUniformGifPalette(colorCount);
    const encoder = new SimpleGifEncoder(width, height, paletteInfo, loop);
    const originalWidth = els.canvas.width;
    const originalHeight = els.canvas.height;
    const previousTime = state.currentTime;
    const previousPlaying = state.playing;
    const previousOverlay = state.showPreviewTimeOverlay;
    const previousRenderScale = state.exportRenderScale;
    let encodedFrames = 0;
    try {
      state.exporting = true;
      state.gifEncodingActive = true;
      state.exportStopRequested = false;
      state.playing = false;
      state.exportRenderScale = width / Math.max(1, originalWidth);
      state.showPreviewTimeOverlay = !!els.exportGifIncludeTimeOverlay?.checked;
      els.canvas.width = width;
      els.canvas.height = height;
      setExportBusy(true);
      const delayHundredths = Math.max(2, Math.round(100 / fps));
      for (let frameIndex = 0; frameIndex < frameCount; frameIndex++) {
        if (state.exportStopRequested) break;
        const frameTime = Math.min(range.end - 0.0001, range.start + frameIndex / fps);
        await seekVisualMediaForExport(frameTime);
        const imageData = ctx.getImageData(0, 0, width, height);
        const indexes = mapRgbaToGifIndexes(imageData.data, width, height, paletteInfo, dither);
        encoder.addFrame(indexes, delayHundredths);
        encodedFrames++;
        const progress = encodedFrames / frameCount;
        updateExportProgress(progress, `Encoding animated GIF: ${encodedFrames}/${frameCount} frames — ${Math.round(progress * 100)}%.`);
        setStatus(`Encoding GIF: ${Math.round(progress * 100)}%...`);
        await new Promise(resolve => setTimeout(resolve, 0));
      }
      if (!encodedFrames) throw new Error('GIF export stopped before any frames were encoded.');
      const blob = encoder.finish();
      triggerBlobDownload(blob, `${normalizeExportBaseName(els.exportFileName?.value)}.gif`);
      const partial = encodedFrames < frameCount;
      updateExportProgress(1, partial ? `Partial GIF saved with ${encodedFrames} frames.` : `Animated GIF complete: ${encodedFrames} frames at ${width}×${height}.`);
      setStatus(partial ? 'Partial GIF export saved.' : 'Exported animated GIF.');
    } finally {
      state.exporting = false;
      state.gifEncodingActive = false;
      state.exportStopRequested = false;
      state.exportRenderScale = previousRenderScale;
      state.showPreviewTimeOverlay = previousOverlay;
      state.currentTime = previousTime;
      state.playing = previousPlaying;
      if (els.canvas.width !== originalWidth || els.canvas.height !== originalHeight) {
        els.canvas.width = originalWidth;
        els.canvas.height = originalHeight;
      }
      syncAudioVideo();
      drawPreview();
      renderPlayhead();
      updateViewportSideBanners();
      setExportBusy(false);
    }
  }

  function concatFloat32Chunks(chunks, expectedLength = null) {
    const available = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
    const length = expectedLength == null ? available : Math.max(0, expectedLength);
    const output = new Float32Array(length);
    let offset = 0;
    for (const chunk of chunks) {
      if (offset >= length) break;
      output.set(chunk.subarray(0, Math.min(chunk.length, length - offset)), offset);
      offset += Math.min(chunk.length, length - offset);
    }
    return output;
  }

  function resampleFloat32(input, sourceRate, targetRate) {
    if (!input.length || sourceRate === targetRate) return input.slice();
    const outputLength = Math.max(1, Math.round(input.length * targetRate / sourceRate));
    const output = new Float32Array(outputLength);
    const ratio = sourceRate / targetRate;
    for (let i = 0; i < outputLength; i++) {
      const sourcePosition = i * ratio;
      const left = Math.floor(sourcePosition);
      const right = Math.min(input.length - 1, left + 1);
      const mix = sourcePosition - left;
      output[i] = (input[left] || 0) * (1 - mix) + (input[right] || 0) * mix;
    }
    return output;
  }

  function encodeWavBlob(channels, sampleRate, encoding) {
    const channelCount = channels.length;
    const sampleCount = channels[0]?.length || 0;
    const isFloat = encoding === '32f';
    const bitDepth = isFloat ? 32 : Number(encoding) === 24 ? 24 : 16;
    const bytesPerSample = bitDepth / 8;
    const dataLength = sampleCount * channelCount * bytesPerSample;
    const buffer = new ArrayBuffer(44 + dataLength);
    const view = new DataView(buffer);
    const writeAscii = (offset, text) => { for (let i = 0; i < text.length; i++) view.setUint8(offset + i, text.charCodeAt(i)); };
    writeAscii(0, 'RIFF');
    view.setUint32(4, 36 + dataLength, true);
    writeAscii(8, 'WAVE');
    writeAscii(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, isFloat ? 3 : 1, true);
    view.setUint16(22, channelCount, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * channelCount * bytesPerSample, true);
    view.setUint16(32, channelCount * bytesPerSample, true);
    view.setUint16(34, bitDepth, true);
    writeAscii(36, 'data');
    view.setUint32(40, dataLength, true);
    let offset = 44;
    for (let i = 0; i < sampleCount; i++) {
      for (let channel = 0; channel < channelCount; channel++) {
        const sample = clamp(channels[channel][i] || 0, -1, 1);
        if (isFloat) {
          view.setFloat32(offset, sample, true);
          offset += 4;
        } else if (bitDepth === 24) {
          let value = sample < 0 ? Math.round(sample * 0x800000) : Math.round(sample * 0x7FFFFF);
          if (value < 0) value += 0x1000000;
          view.setUint8(offset, value & 255);
          view.setUint8(offset + 1, (value >>> 8) & 255);
          view.setUint8(offset + 2, (value >>> 16) & 255);
          offset += 3;
        } else {
          const value = sample < 0 ? Math.round(sample * 0x8000) : Math.round(sample * 0x7FFF);
          view.setInt16(offset, value, true);
          offset += 2;
        }
      }
    }
    return new Blob([buffer], { type: 'audio/wav' });
  }

  async function exportWavAudio() {
    const range = getExportRange();
    const exportDuration = range.end - range.start;
    if (!(exportDuration > 0)) throw new Error('The WAV export range is empty.');
    await prepareAudioGraph({ force: true });
    if (!state.audioContext || !state.audioDestination) {
      await restoreIosNativePreviewElements();
      throw new Error('Timeline audio capture is unavailable.');
    }
    const sourceRate = state.audioContext.sampleRate;
    const requestedChannels = Number(els.exportWavChannels?.value) === 1 ? 1 : 2;
    const targetRate = [44100, 48000, 96000].includes(Number(els.exportWavSampleRate?.value)) ? Number(els.exportWavSampleRate.value) : 48000;
    const encoding = ['16', '24', '32f'].includes(els.exportWavBitDepth?.value) ? els.exportWavBitDepth.value : '16';
    const leftChunks = [];
    const rightChunks = [];
    const previousTime = state.currentTime;
    const previousPlaying = state.playing;
    let mediaSource = null;
    let processor = null;
    let muteGain = null;
    let capturedSamples = 0;
    let captureEnabled = false;
    try {
      state.exporting = true;
      state.exportStopRequested = false;
      state.exportPlaybackEnd = range.end;
      setExportBusy(true);
      mediaSource = state.audioContext.createMediaStreamSource(state.audioDestination.stream);
      processor = state.audioContext.createScriptProcessor(4096, 2, 2);
      muteGain = state.audioContext.createGain();
      muteGain.gain.value = 0;
      mediaSource.connect(processor);
      processor.connect(muteGain);
      muteGain.connect(state.audioContext.destination);
      processor.onaudioprocess = event => {
        if (!captureEnabled) return;
        const input = event.inputBuffer;
        const frames = input.length;
        const left = new Float32Array(frames);
        left.set(input.getChannelData(0));
        let right;
        if (input.numberOfChannels > 1) {
          right = new Float32Array(frames);
          right.set(input.getChannelData(1));
        } else {
          right = left.slice();
        }
        leftChunks.push(left);
        rightChunks.push(right);
        capturedSamples += frames;
      };
      state.currentTime = range.start;
      state.playing = false;
      syncAudioVideo();
      await new Promise(resolve => setTimeout(resolve, 160));
      captureEnabled = true;
      state.lastFrameTime = performance.now();
      state.playing = true;
      syncAudioVideo();
      const startedAt = performance.now();
      while (!state.exportStopRequested && state.currentTime < range.end) {
        const progress = clamp((state.currentTime - range.start) / exportDuration, 0, 1);
        updateExportProgress(progress, `Capturing uncompressed WAV in real time: ${Math.round(progress * 100)}% — keep this tab active.`);
        setStatus(`Exporting WAV: ${Math.round(progress * 100)}%... Keep this tab active.`);
        await new Promise(resolve => setTimeout(resolve, 120));
        if (performance.now() - startedAt > (exportDuration + 5) * 1000) break;
      }
      captureEnabled = false;
      state.playing = false;
      syncAudioVideo();
      await new Promise(resolve => setTimeout(resolve, 80));
      const elapsed = clamp(state.currentTime - range.start, 0, exportDuration);
      const desiredSourceSamples = Math.max(1, Math.round((state.exportStopRequested ? elapsed : exportDuration) * sourceRate));
      let left = concatFloat32Chunks(leftChunks, desiredSourceSamples);
      let right = concatFloat32Chunks(rightChunks, desiredSourceSamples);
      if (requestedChannels === 1) {
        const mono = new Float32Array(left.length);
        for (let i = 0; i < mono.length; i++) mono[i] = ((left[i] || 0) + (right[i] || 0)) * 0.5;
        left = resampleFloat32(mono, sourceRate, targetRate);
        right = null;
      } else {
        left = resampleFloat32(left, sourceRate, targetRate);
        right = resampleFloat32(right, sourceRate, targetRate);
      }
      const blob = encodeWavBlob(requestedChannels === 1 ? [left] : [left, right], targetRate, encoding);
      triggerBlobDownload(blob, `${normalizeExportBaseName(els.exportFileName?.value)}.wav`);
      const stopped = state.exportStopRequested;
      const depthLabel = encoding === '32f' ? '32-bit float' : `${encoding}-bit PCM`;
      updateExportProgress(1, stopped ? 'Partial WAV export saved.' : `WAV complete: ${targetRate / 1000} kHz, ${depthLabel}, ${requestedChannels === 1 ? 'mono' : 'stereo'}.`);
      setStatus(stopped ? 'Partial WAV export saved.' : 'Exported uncompressed WAV audio.');
    } finally {
      captureEnabled = false;
      if (processor) {
        processor.onaudioprocess = null;
        try { processor.disconnect(); } catch (err) {}
      }
      try { mediaSource?.disconnect(); } catch (err) {}
      try { muteGain?.disconnect(); } catch (err) {}
      state.playing = false;
      state.exportPlaybackEnd = null;
      state.currentTime = previousTime;
      state.exporting = false;
      await restoreIosNativePreviewElements();
      state.playing = previousPlaying;
      state.exportStopRequested = false;
      syncAudioVideo();
      drawPreview();
      renderPlayhead();
      setExportBusy(false);
    }
  }

  async function exportCurrentFrame() {
    const mimeType = els.exportFormat.value;
    const scale = clamp(Number(els.exportImageScale?.value) || 1, 0.25, 4);
    const quality = clamp((Number(els.exportImageQuality?.value) || 92) / 100, 0.1, 1);
    const originalWidth = els.canvas.width;
    const originalHeight = els.canvas.height;
    const targetWidth = Math.max(1, Math.round(originalWidth * scale));
    const targetHeight = Math.max(1, Math.round(originalHeight * scale));
    const originalOverlay = state.showPreviewTimeOverlay;
    const previousExporting = state.exporting;
    const previousRenderScale = state.exportRenderScale;
    try {
      state.exporting = true;
      state.exportRenderScale = scale;
      state.showPreviewTimeOverlay = !!els.exportIncludeTimeOverlay?.checked && originalOverlay;
      if (scale !== 1) {
        els.canvas.width = targetWidth;
        els.canvas.height = targetHeight;
      }
      drawPreview();
      const blob = await new Promise((resolve, reject) => {
        els.canvas.toBlob(result => result ? resolve(result) : reject(new Error('The browser could not encode this image format.')), mimeType, quality);
      });
      const extension = extensionForMime(mimeType, 'frame');
      triggerBlobDownload(blob, `${normalizeExportBaseName(els.exportFileName?.value)}.${extension}`);
      updateExportProgress(1, `Image exported at ${targetWidth}×${targetHeight}.`);
      setStatus(`Exported ${extension.toUpperCase()} still frame.`);
    } finally {
      state.showPreviewTimeOverlay = originalOverlay;
      state.exporting = previousExporting;
      state.exportRenderScale = previousRenderScale;
      if (els.canvas.width !== originalWidth || els.canvas.height !== originalHeight) {
        els.canvas.width = originalWidth;
        els.canvas.height = originalHeight;
      }
      drawPreview();
      updateViewportSideBanners();
    }
  }

  async function exportRecordedMedia(mode) {
    const requestedType = els.exportFormat.value;
    const mimeType = resolveRecorderMimeForExport(mode, requestedType);
    if (!requestedType || !mimeType) throw new Error('The selected format is not recordable in this browser.');
    const range = getExportRange();
    const exportDuration = range.end - range.start;
    if (!(exportDuration > 0)) throw new Error('The export range is empty.');

    try {
      await prepareAudioGraph({ force: true });
    } catch (err) {
      await restoreIosNativePreviewElements();
      throw err;
    }
    const previousTime = state.currentTime;
    const previousPlaying = state.playing;
    const previousOverlay = state.showPreviewTimeOverlay;
    const originalWidth = els.canvas.width;
    const originalHeight = els.canvas.height;
    let recorder = null;
    let exportStream = null;
    let canvasStream = null;
    const chunks = [];

    try {
      state.exporting = true;
      state.exportStopRequested = false;
      state.exportPlaybackEnd = range.end;
      setExportBusy(true);

      const tracks = [];
      if (mode === 'video') {
        const { width, height } = getExportDimensions();
        state.exportRenderScale = width / Math.max(1, originalWidth);
        els.canvas.width = width;
        els.canvas.height = height;
        state.showPreviewTimeOverlay = !!els.exportIncludeTimeOverlay?.checked;
        drawPreview();
        const fps = clamp(Number(els.exportFps?.value) || 30, 1, 60);
        if (typeof els.canvas.captureStream !== 'function') throw new Error('Canvas video capture is unavailable in this browser.');
        canvasStream = els.canvas.captureStream(fps);
        tracks.push(...canvasStream.getVideoTracks());
        if (els.exportIncludeAudio?.checked && state.audioDestination) tracks.push(...state.audioDestination.stream.getAudioTracks());
      } else {
        if (!state.audioDestination) throw new Error('Timeline audio capture is unavailable.');
        tracks.push(...state.audioDestination.stream.getAudioTracks());
      }
      if (!tracks.length) throw new Error(mode === 'audio' ? 'There are no recordable audio tracks.' : 'No recordable tracks were created.');

      exportStream = new MediaStream(tracks);
      const options = mode === 'video'
        ? { videoBitsPerSecond: Number(els.exportVideoBitrate?.value) || 8000000, audioBitsPerSecond: Number(els.exportAudioBitrate?.value) || 192000 }
        : { audioBitsPerSecond: Number(els.exportAudioBitrate?.value) || 192000 };
      recorder = createMediaRecorder(exportStream, mimeType, options);
      recorder.ondataavailable = event => { if (event.data && event.data.size) chunks.push(event.data); };
      const done = new Promise((resolve, reject) => {
        recorder.onerror = event => reject(event.error || new Error('Export recorder failed.'));
        recorder.onstop = resolve;
      });

      state.currentTime = range.start;
      state.playing = false;
      syncAudioVideo();
      drawPreview();
      await new Promise(resolve => setTimeout(resolve, 140));
      drawPreview();
      recorder.start(100);
      state.lastFrameTime = performance.now();
      state.playing = true;
      syncAudioVideo();
      const startedAt = performance.now();
      const modeLabel = mode === 'video' ? 'video' : 'audio';
      while (!state.exportStopRequested && state.currentTime < range.end) {
        const progress = clamp((state.currentTime - range.start) / exportDuration, 0, 1);
        updateExportProgress(progress, `Exporting ${modeLabel} in real time: ${Math.round(progress * 100)}% — keep this tab active.`);
        setStatus(`Exporting ${modeLabel}: ${Math.round(progress * 100)}%... Keep this tab active.`);
        await new Promise(resolve => setTimeout(resolve, 120));
        if (performance.now() - startedAt > (exportDuration + 4) * 1000) break;
      }
      state.playing = false;
      syncAudioVideo();
      if (recorder.state !== 'inactive') recorder.stop();
      await done;
      if (!chunks.length) throw new Error('The browser completed recording without producing export data.');
      const actualType = recorder.mimeType || mimeType;
      let blob = new Blob(chunks, { type: actualType });
      let extension = extensionForMime(requestedType || actualType || mimeType, mode);
      if (mode === 'video' && requestedType === QUICKTIME_EXPORT_VALUE) {
        updateExportProgress(0.99, 'Finalizing QuickTime MOV container…');
        blob = await finalizeQuickTimeMov(blob, actualType || mimeType);
        extension = 'mov';
      } else if (mode === 'audio' && requestedType === M4A_EXPORT_VALUE) {
        updateExportProgress(0.99, 'Finalizing M4A audio container…');
        blob = await finalizeM4a(blob, actualType || mimeType);
        extension = 'm4a';
      }
      triggerBlobDownload(blob, `${normalizeExportBaseName(els.exportFileName?.value)}.${extension}`);
      const stopped = state.exportStopRequested;
      updateExportProgress(1, stopped ? `Partial ${modeLabel} export saved.` : `${modeLabel[0].toUpperCase() + modeLabel.slice(1)} export complete.`);
      setStatus(stopped ? `Partial ${modeLabel} export saved.` : `Exported ${extension.toUpperCase()} ${modeLabel}.`);
    } finally {
      state.playing = false;
      state.exportPlaybackEnd = null;
      state.exportRenderScale = 1;
      state.showPreviewTimeOverlay = previousOverlay;
      state.currentTime = previousTime;
      state.exporting = false;
      await restoreIosNativePreviewElements();
      state.playing = previousPlaying;
      state.exportStopRequested = false;
      for (const track of exportStream?.getTracks?.() || []) {
        if (!state.audioDestination?.stream?.getTracks?.().includes(track)) {
          try { track.stop(); } catch (err) {}
        }
      }
      for (const track of canvasStream?.getTracks?.() || []) {
        try { track.stop(); } catch (err) {}
      }
      if (els.canvas.width !== originalWidth || els.canvas.height !== originalHeight) {
        els.canvas.width = originalWidth;
        els.canvas.height = originalHeight;
      }
      syncAudioVideo();
      drawPreview();
      renderPlayhead();
      updateViewportSideBanners();
      setExportBusy(false);
    }
  }

  async function startExportAs() {
    if (state.exporting) return;
    const mode = els.exportMode?.value || 'video';
    const infrastructure = getExportInfrastructureStatus(mode);
    if (!getSupportedExportFormats(mode).length || !infrastructure.ok) {
      alert(infrastructure.detail || 'This browser does not support the selected export type.');
      return;
    }
    try {
      updateExportProgress(0, mode === 'frame' ? 'Encoding image…' : mode === 'gif' ? 'Preparing animated GIF…' : 'Preparing live export…');
      if (mode === 'frame') {
        setExportBusy(true);
        await exportCurrentFrame();
        setExportBusy(false);
      } else if (mode === 'gif') {
        await exportAnimatedGif();
      } else if (mode === 'audio' && els.exportFormat?.value === 'audio/wav') {
        await exportWavAudio();
      } else {
        await exportRecordedMedia(mode);
      }
    } catch (err) {
      console.error(err);
      alert(err?.message || 'Export failed in this browser.');
      setStatus('Export failed.');
      setExportBusy(false);
    }
  }


  async function handleMediaInputSelection(input) {
    if (!input || input.dataset.importBusy === '1') return;
    const files = Array.from(input.files || []);
    if (!files.length) {
      input._pendingImportLayerId = null;
      state.pendingImportLayerId = null;
      return;
    }

    input.dataset.importBusy = '1';
    const requestedLayerId = input._pendingImportLayerId || state.pendingImportLayerId;
    const targetLayerId = (requestedLayerId && getLayerById(requestedLayerId))
      ? requestedLayerId
      : getActiveImportLayerId();
    input._pendingImportLayerId = null;
    state.pendingImportLayerId = null;

    try {
      setStatus(`Importing ${files.length} file${files.length === 1 ? '' : 's'}…`);
      // Begin reading immediately after Files returns. Delaying even one frame
      // can leave some iCloud/provider files as unresolved lazy handles.
      const result = await addMediaFiles(files, targetLayerId);
      if (result.added) pushHistory('Add media');
      const issues = result.skipped.length + result.failed.length;
      if (issues) {
        const details = [
          result.skipped.length ? `${result.skipped.length} unsupported` : '',
          result.failed.length ? `${result.failed.length} could not be decoded by this browser` : '',
        ].filter(Boolean).join(', ');
        alert(`${result.added} file${result.added === 1 ? '' : 's'} imported; ${details}.`);
      }
      setStatus(`${result.added} file${result.added === 1 ? '' : 's'} imported${issues ? `; ${issues} not added` : ''}.`);
    } catch (err) {
      alert('Failed to load one or more files. Browser media decoding can be a fussy little beast.');
      console.error(err);
      setStatus('Media load failed.');
    } finally {
      // Clearing permits selecting the exact same iPhone file again.
      input.value = '';
      delete input.dataset.importBusy;
    }
  }

  function bindMediaInput(input) {
    if (!input) return;
    const receiveSelection = () => {
      // Safari normally emits change, but some iOS document providers emit input
      // first. The busy flag makes listening to both safe and idempotent.
      handleMediaInputSelection(input);
    };
    input.addEventListener('input', receiveSelection);
    input.addEventListener('change', receiveSelection);
    input.addEventListener('cancel', () => {
      input._pendingImportLayerId = null;
      state.pendingImportLayerId = null;
      setStatus('Import cancelled.');
    });
  }

  bindMediaInput(els.mediaInput);
  bindMediaInput(els.mobileMediaInput);

  if (els.uploadLayer) els.uploadLayer.addEventListener('change', () => selectLayer(els.uploadLayer.value));
  if (els.addLayerBtn) els.addLayerBtn.addEventListener('click', () => {
    const layer = createLayer('Layer ' + (state.layers.length + 1));
    selectLayer(layer.id);
    pushHistory('Add layer');
  });
  if (els.duplicateLayerBtn) els.duplicateLayerBtn.addEventListener('click', async () => { await duplicateSelectedLayer(); pushHistory('Duplicate layer'); });
  if (els.deleteLayerBtn) els.deleteLayerBtn.addEventListener('click', () => { deleteSelectedLayer(); pushHistory('Delete layer'); });
  els.addTextClipBtn.addEventListener('click', () => { createTextClip(getActiveImportLayerId()); pushHistory('Add text clip'); });
  els.addTransitionBtn.addEventListener('click', () => { createTransitionClip(); pushHistory('Add transition'); });
  els.toggleScrubDrawBtn.addEventListener('click', () => toggleScrubDrawMode());
  els.toggleScrubDrawBtn2.addEventListener('click', () => toggleScrubDrawMode());
  els.toggleSidebarBtn.addEventListener('click', () => {
    if (isMobileLayout()) {
      const opening = !els.app.classList.contains('mobile-sidebar-open');
      if (opening) setMobileView('project');
      else closeMobileSidebar();
      return;
    }
    state.sidebarVisible = !state.sidebarVisible;
    els.app.classList.toggle('sidebar-hidden', !state.sidebarVisible);
    requestAnimationFrame(updateViewportSideBanners);
  });
  els.projectInstructionsHeader.addEventListener('click', () => {
    els.projectInstructionsSection.classList.toggle('collapsed');
    els.projectInstructionsToggle.textContent = els.projectInstructionsSection.classList.contains('collapsed') ? '▶' : '▼';
  });


  if (els.mobileNav) {
    els.mobileNav.addEventListener('click', (e) => {
      const button = e.target.closest('[data-mobile-view]');
      if (!button) return;
      setMobileView(button.dataset.mobileView);
    });
  }
  if (els.mobileSettingsBtn) els.mobileSettingsBtn.addEventListener('click', () => openUiSettings(els.mobileSettingsBtn));
  if (els.mobileSidebarBackdrop) els.mobileSidebarBackdrop.addEventListener('click', closeMobileSidebar);
  if (els.mobileHeaderMenuBtn) els.mobileHeaderMenuBtn.addEventListener('click', () => els.toggleSidebarBtn?.click());
  if (els.mobileProjectCloseBtn) els.mobileProjectCloseBtn.addEventListener('click', closeMobileSidebar);
  if (els.mobileMediaInput) {
    const prepareNativeMobileImport = () => {
      const targetLayerId = getActiveImportLayerId();
      state.pendingImportLayerId = targetLayerId;
      els.mobileMediaInput._pendingImportLayerId = targetLayerId;
      setStatus('Choose media to import into the selected layer…');
    };
    // Use one pre-picker event only. Registering both pointerdown and touchstart
    // can clear or re-arm the native control twice on iPhone Safari.
    if (window.PointerEvent) els.mobileMediaInput.addEventListener('pointerdown', prepareNativeMobileImport, { passive: true });
    else els.mobileMediaInput.addEventListener('touchstart', prepareNativeMobileImport, { passive: true });
    els.mobileMediaInput.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') prepareNativeMobileImport();
    });
  }
  if (els.mobilePlayPauseBtn) els.mobilePlayPauseBtn.addEventListener('click', togglePlayback);
  if (els.mobileStopBtn) els.mobileStopBtn.addEventListener('click', stopPlayback);
  if (els.mobileUndoBtn) els.mobileUndoBtn.addEventListener('click', undoHistory);
  if (els.mobileExportBtn) els.mobileExportBtn.addEventListener('click', openExportDialog);
  if (els.mobileAddLayerBtn) els.mobileAddLayerBtn.addEventListener('click', () => els.addLayerBtn?.click());
  if (els.mobileDuplicateLayerBtn) els.mobileDuplicateLayerBtn.addEventListener('click', () => els.duplicateLayerBtn?.click());
  if (els.mobileDeleteLayerBtn) els.mobileDeleteLayerBtn.addEventListener('click', () => els.deleteLayerBtn?.click());
  if (els.mobileSplitBtn) els.mobileSplitBtn.addEventListener('click', splitSelectedClipsAtPlayhead);
  if (els.mobileSnapBtn) els.mobileSnapBtn.addEventListener('click', () => els.toggleSnapBtn?.click());
  if (els.mobileTimelineZoomOutBtn) els.mobileTimelineZoomOutBtn.addEventListener('click', () => setZoomAtClientX(state.pxPerSecond / 1.25, mobileTimelineAnchorX()));
  if (els.mobileTimelineZoomInBtn) els.mobileTimelineZoomInBtn.addEventListener('click', () => setZoomAtClientX(state.pxPerSecond * 1.25, mobileTimelineAnchorX()));
  if (els.mobileTimelineFitBtn) els.mobileTimelineFitBtn.addEventListener('click', fitTimelineView);
  if (els.mobileMultiSelectBtn) els.mobileMultiSelectBtn.addEventListener('click', () => {
    state.mobileMultiSelectMode = !state.mobileMultiSelectMode;
    updateMobileMultiSelectButton();
    setStatus(state.mobileMultiSelectMode ? 'Mobile multi-select enabled. Tap clips to add or remove them.' : 'Mobile multi-select disabled.');
  });
  if (els.mobileClipActionsBtn) els.mobileClipActionsBtn.addEventListener('click', () => {
    openClipContextMenu(window.innerWidth / 2, Math.max(80, window.innerHeight - 220));
  });
  if (els.zoomOutBtn) els.zoomOutBtn.addEventListener('click', () => setZoomAtClientX(state.pxPerSecond / 1.25, mobileTimelineAnchorX()));
  if (els.zoomInBtn) els.zoomInBtn.addEventListener('click', () => setZoomAtClientX(state.pxPerSecond * 1.25, mobileTimelineAnchorX()));


  async function startPlayback() {
    await prepareAudioGraph();
    state.lastFrameTime = performance.now();
    state.playing = true;
    const previousForceSync = state.forceMediaSync;
    state.forceMediaSync = true;
    try { syncAudioVideo(); }
    finally { state.forceMediaSync = previousForceSync; }
  }

  function pausePlayback() {
    state.playing = false;
    syncAudioVideo();
  }

  function stopPlayback() {
    state.playing = false;
    setCurrentTime(0);
  }

  async function togglePlayback() {
    if (state.playing) pausePlayback();
    else await startPlayback();
  }

  els.playBtn.addEventListener('click', startPlayback);
  els.pauseBtn.addEventListener('click', pausePlayback);
  els.stopBtn.addEventListener('click', stopPlayback);
  if (els.fullscreenPlayBtn) els.fullscreenPlayBtn.addEventListener('click', async () => {
    pokeFullscreenControls();
    await startPlayback();
  });
  if (els.fullscreenPauseBtn) els.fullscreenPauseBtn.addEventListener('click', () => {
    pokeFullscreenControls();
    pausePlayback();
  });
  if (els.fullscreenStopBtn) els.fullscreenStopBtn.addEventListener('click', () => {
    pokeFullscreenControls();
    stopPlayback();
  });
  if (els.fullscreenScrubber) {
    const beginFullscreenScrub = () => {
      state.fullscreenScrubbing = true;
      pokeFullscreenControls();
    };
    const endFullscreenScrub = () => {
      state.fullscreenScrubbing = false;
      scheduleFullscreenControlsHide();
    };
    els.fullscreenScrubber.addEventListener('input', (e) => {
      pokeFullscreenControls();
      setCurrentTime(e.target.value);
    });
    els.fullscreenScrubber.addEventListener('pointerdown', beginFullscreenScrub);
    els.fullscreenScrubber.addEventListener('pointerup', endFullscreenScrub);
    els.fullscreenScrubber.addEventListener('pointercancel', endFullscreenScrub);
    els.fullscreenScrubber.addEventListener('change', endFullscreenScrub);
  }
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
      cancelPendingHistory();
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
      alert('Project load failed. File may be malformed.');
      setStatus('Project load failed.');
    } finally {
      e.target.value = '';
    }
  });
  if (els.togglePreviewTimeOverlay) els.togglePreviewTimeOverlay.addEventListener('change', () => {
    state.showPreviewTimeOverlay = !!els.togglePreviewTimeOverlay.checked;
    drawPreview();
    pushHistory('Toggle preview time overlay');
  });
  els.exportBtn.addEventListener('click', openExportDialog);
  els.startExportBtn?.addEventListener('click', startExportAs);
  els.closeExportBtn?.addEventListener('click', () => closeExportDialog());
  els.cancelExportBtn?.addEventListener('click', () => closeExportDialog());
  els.stopExportBtn?.addEventListener('click', () => { state.exportStopRequested = true; setStatus(state.gifEncodingActive ? 'Stopping GIF after the current frame…' : 'Stopping export after the current audio/video chunk…'); });
  els.exportMode?.addEventListener('change', updateExportUi);
  for (const button of els.exportModeShortcuts || []) {
    button.addEventListener('click', () => {
      if (!els.exportMode) return;
      els.exportMode.value = button.dataset.exportModeShortcut || 'video';
      updateExportUi();
    });
  }
  els.exportFormat?.addEventListener('change', updateExportUi);
  els.exportResolution?.addEventListener('change', updateExportUi);
  els.exportGifResolution?.addEventListener('change', updateExportUi);
  els.exportRange?.addEventListener('change', updateExportUi);
  els.exportOverlay?.addEventListener('pointerdown', (event) => { if (event.target === els.exportOverlay && !state.exporting) closeExportDialog(); });
  if (els.previewFullscreenBtn) els.previewFullscreenBtn.addEventListener('click', togglePreviewFullscreen);
  if (els.mobileFullscreenExitBtn) els.mobileFullscreenExitBtn.addEventListener('click', async (event) => {
    event.preventDefault();
    event.stopPropagation();
    await togglePreviewFullscreen();
  });
  if (els.previewShell) {
    ['pointermove', 'pointerdown'].forEach(evt => {
      els.previewShell.addEventListener(evt, () => pokeFullscreenControls(), { passive: true });
    });
  }
  if (els.closeStartupPanelBtn) els.closeStartupPanelBtn.addEventListener('click', closeStartupPanel);
  if (els.showCompatibilityOnStartup) {
    els.showCompatibilityOnStartup.addEventListener('change', () => {
      setCompatibilityStartupPreference(!!els.showCompatibilityOnStartup.checked);
    });
  }
  if (els.dontShowCompatibilityAgain) {
    els.dontShowCompatibilityAgain.addEventListener('change', () => {
      setCompatibilityStartupPreference(!els.dontShowCompatibilityAgain.checked);
    });
  }
  if (els.openCompatibilityBtn) {
    els.openCompatibilityBtn.addEventListener('click', () => {
      closeUiSettings();
      openStartupPanel({ returnToSettings: true });
    });
  }
  if (els.uiSettingsBtn) els.uiSettingsBtn.addEventListener('click', () => {
    if (els.uiSettingsOverlay?.hidden) openUiSettings(els.uiSettingsBtn);
    else closeUiSettings();
  });
  if (els.closeUiSettingsBtn) els.closeUiSettingsBtn.addEventListener('click', closeUiSettings);
  if (els.doneUiSettingsBtn) els.doneUiSettingsBtn.addEventListener('click', closeUiSettings);
  if (els.resetUiScalingBtn) els.resetUiScalingBtn.addEventListener('click', resetUiScaling);
  if (els.installAppBtn) els.installAppBtn.addEventListener('click', requestSanityVideoInstall);
  for (const input of els.uiScaleInputs || []) {
    input.addEventListener('input', () => setUiScale(input.dataset.uiScale, input.value, false));
    input.addEventListener('change', () => setUiScale(input.dataset.uiScale, input.value, true));
  }
  if (els.uiSettingsOverlay) els.uiSettingsOverlay.addEventListener('pointerdown', (e) => {
    if (e.target === els.uiSettingsOverlay) closeUiSettings();
  });
  if (els.helpDonateBtn) els.helpDonateBtn.addEventListener('click', openDonation);
  if (els.closeDonationBtn) els.closeDonationBtn.addEventListener('click', closeDonation);
  if (els.donationOkayBtn) els.donationOkayBtn.addEventListener('click', showDonationLinks);
  if (els.donationOverlay) els.donationOverlay.addEventListener('pointerdown', (e) => {
    if (e.target === els.donationOverlay) closeDonation();
  });
  document.addEventListener('fullscreenchange', () => { updatePreviewFullscreenButton(); if (isPreviewFullscreenActive()) pokeFullscreenControls(); else { clearFullscreenControlsHideTimer(); setFullscreenControlsVisible(false); } requestAnimationFrame(updateViewportSideBanners); });
  document.addEventListener('webkitfullscreenchange', () => { updatePreviewFullscreenButton(); if (isPreviewFullscreenActive()) pokeFullscreenControls(); else { clearFullscreenControlsHideTimer(); setFullscreenControlsVisible(false); } requestAnimationFrame(updateViewportSideBanners); });
  updatePreviewFullscreenButton();
  syncFullscreenControls();

  let scrubbing = false;
  els.ruler.addEventListener('pointerdown', (e) => {
    if (!isPrimaryPointer(e)) return;
    if (e.cancelable) e.preventDefault();
    scrubbing = true;
    setCurrentTimeFromClientX(e.clientX);
    beginWindowPointerDrag(e, (ev) => {
      if (scrubbing) setCurrentTimeFromClientX(ev.clientX);
    }, () => {
      scrubbing = false;
    });
  });

  // Empty track space selects its layer but never seeks. Timeline seeking is
  // intentionally restricted to the ruler above, especially on mobile.
  els.timelineContent.addEventListener('pointerdown', (e) => {
    if (!isPrimaryPointer(e)) return;
    if (e.target.closest('.clip')) return;
    if (e.target.closest('#ruler')) return;
    const tracksRect = els.tracksArea?.getBoundingClientRect();
    if (tracksRect && e.clientY >= tracksRect.top && e.clientY <= tracksRect.bottom) {
      const layerIndex = clamp(Math.floor((e.clientY - tracksRect.top) / getTrackHeight()), 0, Math.max(0, state.layers.length - 1));
      const layer = state.layers[layerIndex];
      if (layer) {
        state.selectedLayerId = layer.id;
        if (els.uploadLayer) els.uploadLayer.value = layer.id;
      }
    }
    if (!e.shiftKey) {
      state.selectedClipId = null;
      state.selectedClipIds = [];
      renderSelection();
      renderTracks();
      updateUploadLayerSelect();
    }
  });


  els.timelineScroll.addEventListener('mousedown', (e) => {
    if (e.button !== 1) return;
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
  els.timelineScroll.addEventListener('scroll', syncTrackListScroll, { passive: true });

  if (els.trackListPane) {
    els.trackListPane.addEventListener('wheel', (e) => {
      const canScrollY = Math.abs(e.deltaY) > Math.abs(e.deltaX);
      if (!canScrollY) return;
      e.preventDefault();
      els.timelineScroll.scrollTop += e.deltaY;
    }, { passive: false });

    els.trackListPane.addEventListener('mousedown', (e) => {
      if (e.button !== 1) return;
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
  }

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
  els.canvas.addEventListener('pointerdown', (e) => {
    if (!state.scrubDrawMode || !isPrimaryPointer(e)) return;
    const info = getSelectedClipInfo();
    if (!info || (info.clip.kind !== 'image' && info.clip.kind !== 'video')) return;
    if (e.cancelable) e.preventDefault();
    scrubPointerStart = getCanvasNormalizedPos(e);
    state.scrubDraft = { x: scrubPointerStart.x, y: scrubPointerStart.y, w: 0.001, h: 0.001 };
    drawPreview();
    beginWindowPointerDrag(e, (ev) => {
      const pos = getCanvasNormalizedPos(ev);
      state.scrubDraft = {
        x: Math.min(scrubPointerStart.x, pos.x),
        y: Math.min(scrubPointerStart.y, pos.y),
        w: Math.max(0.005, Math.abs(pos.x - scrubPointerStart.x)),
        h: Math.max(0.005, Math.abs(pos.y - scrubPointerStart.y)),
      };
      drawPreview();
    }, () => {
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
    });
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
    updateViewportSideBanners();
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
  if (els.transitionType) els.transitionType.addEventListener('input', () => { applyToSelectedClips(clip => { clip.transitionType = els.transitionType.value; }, clip => clip.kind === 'transition'); renderSelection(); drawPreview(); renderTracks(); });
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
    applyToSelectedClips((clip) => { setClipPlaybackRate(clip, els.clipSpeed.value); }, clip => clip.kind === 'video');
    updateProjectDuration();
    renderTracks();
    renderSelection();
    syncAudioVideo();
    drawPreview();
  });
  if (els.resetClipExposure) els.resetClipExposure.addEventListener('click', () => resetSelectedVideoControl('exposure'));
  if (els.resetClipBrightness) els.resetClipBrightness.addEventListener('click', () => resetSelectedVideoControl('brightness'));
  if (els.resetClipContrast) els.resetClipContrast.addEventListener('click', () => resetSelectedVideoControl('contrast'));
  if (els.resetClipHue) els.resetClipHue.addEventListener('click', () => resetSelectedVideoControl('hue'));
  if (els.resetClipSpeed) els.resetClipSpeed.addEventListener('click', () => resetSelectedVideoControl('playbackRate'));
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
  if (els.clipInvert) els.clipInvert.addEventListener('input', () => {
    applyToSelectedClips((clip) => { ensureClipDefaults(clip); clip.invert = !!els.clipInvert.checked; }, clip => isVisualClip(clip));
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
    els.clipText, els.clipFontSize, els.clipColor, els.clipFontFamily, els.clipTextAnimation, els.transitionType, els.wipeEdgeFalloff, els.wipeAngle, els.effectTypeSelect, els.clipExposure, els.clipBrightness, els.clipContrast, els.clipHue, els.clipSpeed,
    els.clipPosX, els.clipPosY, els.clipScale, els.clipRotation, els.clipInvert, els.scrubMode, els.scrubStrength
  ].forEach(primeHistoryForControl);

  window.addEventListener('keydown', async (e) => {
    const target = e.target;
    const typingTarget = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT' || target.isContentEditable);
    if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key.toLowerCase() === 'z') { e.preventDefault(); undoHistory(); }
    else if (((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') || ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'z')) { e.preventDefault(); redoHistory(); }
    else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') { e.preventDefault(); splitSelectedClipsAtPlayhead(); }
    else if (!typingTarget && e.code === 'Space') { e.preventDefault(); await togglePlayback(); }
    else if (e.key === 'Escape' && els.donationOverlay && !els.donationOverlay.hidden) {
      e.preventDefault();
      closeDonation();
    }
    else if (e.key === 'Escape' && els.exportOverlay && !els.exportOverlay.hidden) {
      e.preventDefault();
      closeExportDialog();
    }
    else if (e.key === 'Escape' && els.startupOverlay && !els.startupOverlay.hidden) {
      e.preventDefault();
      closeStartupPanel();
    }
    else if (e.key === 'Escape' && els.uiSettingsOverlay && !els.uiSettingsOverlay.hidden) {
      e.preventDefault();
      closeUiSettings();
    }
    else if (!typingTarget && e.key === 'Escape' && isPreviewFullscreenActive()) {
      e.preventDefault();
      await togglePreviewFullscreen();
    }
    else if (!typingTarget && e.key === 'Escape') {
      e.preventDefault();
      stopPlayback();
      closeClipContextMenu();
    }
  });

  loadUiScalePreferences();
  applyUiScalePreferences({ persist: false, rerenderTimeline: false });
  updateInstallAppUi();
  window.addEventListener('load', registerSanityVideoServiceWorker, { once: true });
  setStatus(`Ready. ${APP_BRAND} is armed. Export As supports browser-detected MOV, MP4, WebM, GIF, dedicated M4A, WAV, compressed audio, and still-image formats.`);
  createLayer('Layer 1');
  createLayer('Layer 2');
  createLayer('Layer 3');
  renderAll();
  pushHistory('Initial');
  updateUndoRedoButtons();
  updateMobileMultiSelectButton();
  if (els.app) els.app.dataset.mobileView = 'preview';
  if (isMobileLayout()) setMobileView('preview');
  window.addEventListener('resize', () => {
    applyUiScalePreferences({ persist: false });
    updateViewportSideBanners();
    if (!isMobileLayout()) {
      els.app.classList.remove('mobile-sidebar-open');
      els.app.removeAttribute('data-mobile-view');
    } else if (!els.app.dataset.mobileView) {
      setMobileView(state.mobileView || 'preview');
    }
  });
  if (window.ResizeObserver && els.previewShell) {
    const previewResizeObserver = new ResizeObserver(() => updateViewportSideBanners());
    previewResizeObserver.observe(els.previewShell);
    if (els.viewerPane) previewResizeObserver.observe(els.viewerPane);
  }
  requestAnimationFrame(updateViewportSideBanners);
  updateCompatibilityPreferenceUi();
  if (shouldShowCompatibilityOnStartup()) openStartupPanel();
  requestAnimationFrame(frame);
})();