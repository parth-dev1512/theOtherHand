// ─── Canvas Drawing Engine ─────────────────────────────────────
// Smooth ink simulation with pressure-like width and undo support.

export class CanvasEngine {
  constructor(canvasEl) {
    this.canvas = canvasEl;
    this.ctx = canvasEl.getContext('2d');
    this.drawing = false;
    this.points = [];        // current stroke points
    this.strokes = [];       // completed strokes (for undo)
    this.currentTemplate = null;

    this._resizeCanvas();
    this._bindEvents();

    // Redraw on resize
    window.addEventListener('resize', () => {
      this._resizeCanvas();
      this._redrawAll();
    });
  }

  _resizeCanvas() {
    const rect = this.canvas.parentElement.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.canvas.style.width = rect.width + 'px';
    this.canvas.style.height = rect.height + 'px';
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  _bindEvents() {
    const c = this.canvas;

    // Mouse
    c.addEventListener('mousedown', (e) => this._startStroke(e.offsetX, e.offsetY));
    c.addEventListener('mousemove', (e) => { if (this.drawing) this._addPoint(e.offsetX, e.offsetY); });
    c.addEventListener('mouseup', () => this._endStroke());
    c.addEventListener('mouseleave', () => { if (this.drawing) this._endStroke(); });

    // Touch
    c.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const t = e.touches[0];
      const r = c.getBoundingClientRect();
      this._startStroke(t.clientX - r.left, t.clientY - r.top);
    }, { passive: false });

    c.addEventListener('touchmove', (e) => {
      e.preventDefault();
      if (!this.drawing) return;
      const t = e.touches[0];
      const r = c.getBoundingClientRect();
      this._addPoint(t.clientX - r.left, t.clientY - r.top);
    }, { passive: false });

    c.addEventListener('touchend', (e) => {
      e.preventDefault();
      this._endStroke();
    });
  }

  _startStroke(x, y) {
    this.drawing = true;
    this.points = [{ x, y }];
  }

  _addPoint(x, y) {
    this.points.push({ x, y });
    this._drawCurrentStroke();
  }

  _endStroke() {
    if (this.points.length > 1) {
      this.strokes.push([...this.points]);
    }
    this.drawing = false;
    this.points = [];
    this._redrawAll();
  }

  _drawCurrentStroke() {
    // Redraw all + live stroke
    this._redrawAll();
    this._drawSmooth(this.points, false);
  }

  _drawSmooth(pts, isHistory = true) {
    if (pts.length < 2) return;
    const ctx = this.ctx;

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Get CSS custom property for ink color
    const style = getComputedStyle(document.documentElement);
    const inkColor = style.getPropertyValue('--ink-color').trim() || '#e0d6ff';
    ctx.strokeStyle = isHistory ? inkColor : inkColor;

    for (let i = 1; i < pts.length; i++) {
      const prev = pts[i - 1];
      const curr = pts[i];

      // Simulate pressure: thicker when moving slowly
      const dist = Math.hypot(curr.x - prev.x, curr.y - prev.y);
      const baseWidth = 2.5;
      const maxWidth = 5;
      const speed = Math.min(dist, 40);
      const width = maxWidth - (speed / 40) * (maxWidth - baseWidth);

      ctx.lineWidth = width;
      ctx.beginPath();
      ctx.moveTo(prev.x, prev.y);

      // Quadratic smoothing with midpoint
      if (i < pts.length - 1) {
        const next = pts[i + 1];
        const mx = (curr.x + next.x) / 2;
        const my = (curr.y + next.y) / 2;
        ctx.quadraticCurveTo(curr.x, curr.y, mx, my);
      } else {
        ctx.lineTo(curr.x, curr.y);
      }

      ctx.stroke();
    }
  }

  _redrawAll() {
    const ctx = this.ctx;
    const w = this.canvas.width / (window.devicePixelRatio || 1);
    const h = this.canvas.height / (window.devicePixelRatio || 1);

    ctx.clearRect(0, 0, w, h);

    // Draw template
    if (this.currentTemplate) {
      this._drawTemplate(w, h);
    }

    // Draw guide lines
    this._drawGuideLines(w, h);

    // Redraw all saved strokes
    for (const stroke of this.strokes) {
      this._drawSmooth(stroke, true);
    }
  }

  _drawTemplate(w, h) {
    const ctx = this.ctx;
    const style = getComputedStyle(document.documentElement);
    const templateColor = style.getPropertyValue('--template-color').trim() || 'rgba(124,92,252,0.12)';

    ctx.save();
    ctx.fillStyle = templateColor;

    const text = this.currentTemplate;
    // Dynamic font size based on text length
    let fontSize = Math.min(w, h) * 0.55;
    if (text.length > 3) fontSize = Math.min(w, h) * 0.15;
    if (text.length > 10) fontSize = Math.min(w, h) * 0.08;

    ctx.font = `300 ${fontSize}px 'Inter', sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, w / 2, h / 2);
    ctx.restore();
  }

  _drawGuideLines(w, h) {
    const ctx = this.ctx;
    const style = getComputedStyle(document.documentElement);
    const guideColor = style.getPropertyValue('--guide-color').trim() || 'rgba(255,255,255,0.04)';

    ctx.save();
    ctx.strokeStyle = guideColor;
    ctx.lineWidth = 1;
    ctx.setLineDash([6, 8]);

    // Middle horizontal guide
    ctx.beginPath();
    ctx.moveTo(0, h / 2);
    ctx.lineTo(w, h / 2);
    ctx.stroke();

    // Middle vertical guide
    ctx.beginPath();
    ctx.moveTo(w / 2, 0);
    ctx.lineTo(w / 2, h);
    ctx.stroke();

    // Baseline (lower third)
    ctx.beginPath();
    ctx.moveTo(0, h * 0.7);
    ctx.lineTo(w, h * 0.7);
    ctx.stroke();

    // Cap line (upper third)
    ctx.beginPath();
    ctx.moveTo(0, h * 0.3);
    ctx.lineTo(w, h * 0.3);
    ctx.stroke();

    ctx.setLineDash([]);
    ctx.restore();
  }

  setTemplate(text) {
    this.currentTemplate = text;
    this._redrawAll();
  }

  clear() {
    this.strokes = [];
    this.points = [];
    this._redrawAll();
  }

  undo() {
    if (this.strokes.length > 0) {
      this.strokes.pop();
      this._redrawAll();
    }
  }

  hasContent() {
    return this.strokes.length > 0;
  }

  resize() {
    this._resizeCanvas();
    this._redrawAll();
  }
}
