// ========================================
// NEXUS CHEM LAB — MAIN APPLICATION SCRIPT
// Navigation, Periodic Table, Calculators, Library, Animations
// ========================================

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    initParticles();
    initNavigation();
    initPeriodicTable();
    initCalculators();
    initLibrary();
    initDashboard();
    initTiltEffect();
    hideLoadingScreen();
});

// ===== LOADING SCREEN =====
function hideLoadingScreen() {
    setTimeout(() => {
        document.getElementById('loadingScreen').classList.add('hidden');
    }, 1800);
}

// ===== PARTICLE BACKGROUND =====
function initParticles() {
    const canvas = document.getElementById('particleCanvas');
    const ctx = canvas.getContext('2d');
    let particles = [];
    const PARTICLE_COUNT = 80;

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    class Particle {
        constructor() {
            this.reset();
        }
        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.vx = (Math.random() - 0.5) * 0.3;
            this.vy = (Math.random() - 0.5) * 0.3;
            this.radius = Math.random() * 2 + 0.5;
            this.opacity = Math.random() * 0.4 + 0.1;
            this.color = Math.random() > 0.5 ? '168, 85, 247' : '6, 182, 212';
        }
        update() {
            this.x += this.vx;
            this.y += this.vy;
            if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
            if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
        }
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${this.color}, ${this.opacity})`;
            ctx.fill();
        }
    }

    for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push(new Particle());
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw connections
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 150) {
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(168, 85, 247, ${0.06 * (1 - dist / 150)})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }

        particles.forEach(p => {
            p.update();
            p.draw();
        });

        requestAnimationFrame(animate);
    }
    animate();
}

// ===== NAVIGATION =====
function initNavigation() {
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            switchTab(tab.dataset.tab);
        });
    });

    document.querySelectorAll('.calc-tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            switchCalcPanel(btn.dataset.calc);
        });
    });
}

function switchTab(tabName) {
    // Update nav tabs
    document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
    document.querySelector(`.nav-tab[data-tab="${tabName}"]`).classList.add('active');

    // Update content
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    document.getElementById(`tab-${tabName}`).classList.add('active');

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function switchCalcPanel(calcName) {
    document.querySelectorAll('.calc-tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelector(`.calc-tab-btn[data-calc="${calcName}"]`).classList.add('active');

    document.querySelectorAll('.calc-panel').forEach(p => p.classList.remove('active'));
    document.getElementById(`calc-${calcName}`).classList.add('active');
}

// ===== 3D TILT EFFECT =====
function initTiltEffect() {
    document.querySelectorAll('.tilt-card').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = ((y - centerY) / centerY) * -5;
            const rotateY = ((x - centerX) / centerX) * 5;
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
        });
    });
}

// ===== PERIODIC TABLE =====
function initPeriodicTable() {
    renderPeriodicTable();
}

function renderPeriodicTable() {
    const grid = document.getElementById('periodicTableGrid');
    grid.innerHTML = '';

    // Create 18 columns x 10 rows grid (rows 1-7 + gaps + lanthanides + actinides)
    // Map each element to its position
    const elementMap = {};
    ELEMENTS.forEach(el => {
        elementMap[`${el.row}-${el.col}`] = el;
    });

    // Add gap markers
    GAP_MARKERS.forEach(gm => {
        elementMap[`${gm.row}-${gm.col}`] = { gap: true, label: gm.label };
    });

    for (let row = 1; row <= 10; row++) {
        for (let col = 1; col <= 18; col++) {
            const key = `${row}-${col}`;
            const data = elementMap[key];

            if (data) {
                if (data.gap) {
                    const gapEl = document.createElement('div');
                    gapEl.className = 'element-cell gap-indicator';
                    gapEl.innerHTML = `<span style="font-size:0.5rem;color:var(--lavender-dim)">${data.label}</span>`;
                    gapEl.style.gridColumn = col;
                    gapEl.style.gridRow = row;
                    grid.appendChild(gapEl);
                } else {
                    const cell = document.createElement('div');
                    cell.className = 'element-cell';
                    cell.dataset.z = data.z;
                    cell.dataset.cat = data.cat;
                    const catColor = CATEGORIES[data.cat]?.color || '#a855f7';
                    cell.style.setProperty('--cell-color', catColor);
                    cell.style.borderColor = catColor + '33';

                    cell.innerHTML = `
                        <span class="el-number">${data.z}</span>
                        <span class="el-symbol">${data.symbol}</span>
                        <span class="el-name">${data.name}</span>
                        <span class="el-mass">${typeof data.mass === 'number' ? data.mass.toFixed(1) : data.mass}</span>
                    `;

                    cell.addEventListener('click', () => showElementDetail(data));
                    grid.appendChild(cell);
                }
            }
        }
    }
}

function filterPeriodicTable() {
    const filter = document.getElementById('categoryFilter').value;
    document.querySelectorAll('.element-cell:not(.gap-indicator)').forEach(cell => {
        if (filter === 'all') {
            cell.classList.remove('filtered-out');
        } else {
            if (cell.dataset.cat === filter) {
                cell.classList.remove('filtered-out');
            } else {
                cell.classList.add('filtered-out');
            }
        }
    });
}

function resetFilter() {
    document.getElementById('categoryFilter').value = 'all';
    document.querySelectorAll('.element-cell:not(.gap-indicator)').forEach(cell => {
        cell.classList.remove('filtered-out');
    });
}

function showElementDetail(el) {
    const panel = document.getElementById('elementDetail');
    document.getElementById('detailSymbol').textContent = el.symbol;
    document.getElementById('detailName').textContent = el.name;
    document.getElementById('detailNumber').textContent = `Número Atômico: ${el.z}`;
    document.getElementById('detailMass').textContent = `Massa Atômica: ${typeof el.mass === 'number' ? el.mass + ' u' : el.mass + ' u'}`;
    document.getElementById('detailCategory').textContent = CATEGORIES[el.cat]?.label || el.cat;
    document.getElementById('detailPhase').textContent = el.phase === '?' ? 'Desconhecida' : el.phase;
    document.getElementById('detailEN').textContent = el.en !== '?' && el.en !== undefined ? el.en + ' (Pauling)' : 'N/A';
    document.getElementById('detailDensity').textContent = el.density !== '?' && el.density !== undefined ? el.density + ' g/cm³' : 'N/A';
    document.getElementById('detailFusion').textContent = el.fusion !== '?' && el.fusion !== undefined ? el.fusion + ' °C' : 'N/A';
    document.getElementById('detailBoiling').textContent = el.boiling !== '?' && el.boiling !== undefined ? el.boiling + ' °C' : 'N/A';
    document.getElementById('detailConfig').textContent = el.config;
    document.getElementById('detailDiscovery').textContent = el.discovery;

    panel.classList.add('visible');

    // Draw Bohr model
    drawBohrModel(el.z);
}

function closeElementDetail() {
    document.getElementById('elementDetail').classList.remove('visible');
}

function drawBohrModel(z) {
    const canvas = document.getElementById('bohrCanvas');
    const ctx = canvas.getContext('2d');
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Electron shell configuration
    const shells = getElectronShells(z);

    // Draw nucleus
    const nucleusRadius = Math.min(15, z * 0.15);
    const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, nucleusRadius);
    gradient.addColorStop(0, '#a855f7');
    gradient.addColorStop(1, '#6b21a8');
    ctx.beginPath();
    ctx.arc(cx, cy, nucleusRadius, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();
    ctx.shadowColor = '#a855f7';
    ctx.shadowBlur = 20;
    ctx.fill();
    ctx.shadowBlur = 0;

    // Draw nucleus text
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 10px Orbitron';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(z.toString(), cx, cy);

    // Draw shells and electrons
    const maxShellRadius = 85;
    shells.forEach((count, i) => {
        if (count === 0) return;
        const shellRadius = 25 + (i + 1) * 18;

        // Shell ring
        ctx.beginPath();
        ctx.arc(cx, cy, shellRadius, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(168, 85, 247, 0.2)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Electrons on shell
        const maxElectrons = [2, 8, 8, 18, 18, 32, 32][i] || 8;
        const actualElectrons = Math.min(count, maxElectrons);

        for (let j = 0; j < actualElectrons; j++) {
            const angle = (j / actualElectrons) * Math.PI * 2 - Math.PI / 2;
            const ex = cx + Math.cos(angle) * shellRadius;
            const ey = cy + Math.sin(angle) * shellRadius;

            ctx.beginPath();
            ctx.arc(ex, ey, 3, 0, Math.PI * 2);
            ctx.fillStyle = '#06b6d4';
            ctx.shadowColor = '#06b6d4';
            ctx.shadowBlur = 8;
            ctx.fill();
            ctx.shadowBlur = 0;
        }
    });
}

function getElectronShells(z) {
    // Simplified electron shell distribution
    const shells = [0, 0, 0, 0, 0, 0, 0];
    const maxPerShell = [2, 8, 18, 32, 32, 18, 8];
    let remaining = z;

    for (let i = 0; i < 7 && remaining > 0; i++) {
        const taken = Math.min(remaining, maxPerShell[i]);
        shells[i] = taken;
        remaining -= taken;
    }

    return shells;
}

// ===== CALCULATORS =====
function initCalculators() {
    // pH method toggle
    // Set default alpha for strong acids/bases
    document.getElementById('ph_natureza').addEventListener('change', updatePhDefaults);
    document.getElementById('ph_forca').addEventListener('change', updatePhDefaults);
    updatePhDefaults();
}

function updatePhDefaults() {
    const forca = document.getElementById('ph_forca').value;
    const alphaInput = document.getElementById('ph_alpha');
    if (forca === 'forte') {
        alphaInput.value = 100;
        alphaInput.disabled = true;
    } else {
        alphaInput.disabled = false;
        if (forca === 'moderado') alphaInput.value = 50;
        else alphaInput.value = '';
    }
}

function setPhMethod(method) {
    document.querySelectorAll('.ph-toggle-btn').forEach(b => b.classList.remove('active'));
    document.querySelector(`.ph-toggle-btn[data-method="${method}"]`).classList.add('active');

    document.getElementById('phAlphaGroup').style.display = method === 'alpha' ? 'block' : 'none';
    document.getElementById('phKaGroup').style.display = method === 'ka' ? 'block' : 'none';
}

// --- CALC 1: Relações de Pertinência ---
function calcPertinencia() {
    const z1 = parseInt(document.getElementById('p1_Z').value);
    const a1 = parseInt(document.getElementById('p1_A').value);
    const c1 = parseInt(document.getElementById('p1_C').value) || 0;
    const z2 = parseInt(document.getElementById('p2_Z').value);
    const a2 = parseInt(document.getElementById('p2_A').value);
    const c2 = parseInt(document.getElementById('p2_C').value) || 0;

    // Validation
    const fields = [
        { id: 'p1_Z', val: z1 }, { id: 'p1_A', val: a1 }, { id: 'p2_Z', val: z2 }, { id: 'p2_A', val: a2 }
    ];
    let valid = true;
    fields.forEach(f => {
        const el = document.getElementById(f.id);
        if (isNaN(f.val) || f.val < 1) {
            el.classList.add('error');
            valid = false;
            setTimeout(() => el.classList.remove('error'), 1500);
        }
    });
    if (!valid) return;

    const p1 = z1, n1 = a1 - z1, e1 = z1 - c1;
    const p2 = z2, n2 = a2 - z2, e2 = z2 - c2;

    const isotopos = (p1 === p2 && a1 !== a2);
    const isotonos = (n1 === n2 && z1 !== z2);
    const isobaros = (a1 === a2 && z1 !== z2);
    const isoeletronicos = (e1 === e2);

    const resultsDiv = document.getElementById('pertinenciaResults');
    resultsDiv.innerHTML = `
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px;">
            <div style="padding:16px;background:rgba(168,85,247,0.1);border-radius:12px;border:1px solid var(--border-glass);">
                <h4 style="color:var(--purple-glow);font-family:var(--font-display);font-size:0.85rem;margin-bottom:10px;">Átomo 1</h4>
                <div style="color:var(--lavender);font-size:0.9rem;">
                    <p>⚛ Prótons (p): <strong style="color:var(--white-crystal)">${p1}</strong></p>
                    <p>⚛ Nêutrons (n): <strong style="color:var(--white-crystal)">${n1}</strong></p>
                    <p>⚛ Elétrons (e): <strong style="color:var(--white-crystal)">${e1}</strong></p>
                </div>
            </div>
            <div style="padding:16px;background:rgba(6,182,212,0.1);border-radius:12px;border:1px solid var(--border-glass);">
                <h4 style="color:var(--cyan-quantum);font-family:var(--font-display);font-size:0.85rem;margin-bottom:10px;">Átomo 2</h4>
                <div style="color:var(--lavender);font-size:0.9rem;">
                    <p>⚛ Prótons (p): <strong style="color:var(--white-crystal)">${p2}</strong></p>
                    <p>⚛ Nêutrons (n): <strong style="color:var(--white-crystal)">${n2}</strong></p>
                    <p>⚛ Elétrons (e): <strong style="color:var(--white-crystal)">${e2}</strong></p>
                </div>
            </div>
        </div>
        <h4 style="color:var(--purple-glow);font-family:var(--font-display);font-size:0.9rem;margin-bottom:12px;">Relações Identificadas:</h4>
        <div>
            <span class="relation-badge ${isotopos ? 'yes' : 'no'}">${isotopos ? '✓' : '✗'} Isótopos (mesmo Z, diferente A)</span>
            <span class="relation-badge ${isotonos ? 'yes' : 'no'}">${isotonos ? '✓' : '✗'} Isótonos (mesmo n, diferente Z e A)</span>
            <span class="relation-badge ${isobaros ? 'yes' : 'no'}">${isobaros ? '✓' : '✗'} Isóbaros (mesma A, diferente Z)</span>
            <span class="relation-badge ${isoeletronicos ? 'yes' : 'no'}">${isoeletronicos ? '✓' : '✗'} Isoeletrônicos (mesmo nº de e⁻)</span>
        </div>
    `;

    // Draw comparison visualization
    drawPertinenciaVisualization(p1, n1, e1, p2, n2, e2);

    addToHistory(`Relações: Isótopos=${isotopos}, Isótonos=${isotonos}, Isóbaros=${isobaros}, Isoeletrônicos=${isoeletronicos}`);
}

function drawPertinenciaVisualization(p1, n1, e1, p2, n2, e2) {
    const canvas = document.getElementById('pertinenciaCanvas');
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    const data1 = [
        { label: 'Prótons', value: p1, color: '#ef4444' },
        { label: 'Nêutrons', value: n1, color: '#f59e0b' },
        { label: 'Elétrons', value: e1, color: '#06b6d4' }
    ];
    const data2 = [
        { label: 'Prótons', value: p2, color: '#ef4444' },
        { label: 'Nêutrons', value: n2, color: '#f59e0b' },
        { label: 'Elétrons', value: e2, color: '#06b6d4' }
    ];

    const maxVal = Math.max(p1, n1, e1, p2, n2, e2, 1);
    const barWidth = 40;
    const gap = 12;
    const startX = 80;
    const startY = 40;
    const maxBarHeight = 180;

    // Background
    ctx.fillStyle = 'rgba(5, 2, 12, 0.5)';
    ctx.fillRect(0, 0, w, h);

    // Title
    ctx.fillStyle = '#a855f7';
    ctx.font = 'bold 14px Orbitron';
    ctx.textAlign = 'center';
    ctx.fillText('Comparação de Partículas Subatômicas', w / 2, 25);

    // Draw bars
    function drawBars(data, offsetX, label) {
        ctx.fillStyle = '#94a3b8';
        ctx.font = '11px Rajdhani';
        ctx.textAlign = 'center';
        ctx.fillText(label, offsetX + barWidth + gap * 1.5, startY - 5);

        data.forEach((d, i) => {
            const barH = (d.value / maxVal) * maxBarHeight;
            const x = offsetX;
            const y = startY + i * (barH > 50 ? 80 : 70);

            // Bar
            const grad = ctx.createLinearGradient(x, y, x, y + barH);
            grad.addColorStop(0, d.color);
            grad.addColorStop(1, d.color + '44');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.roundRect(x, y, barWidth, barH, 4);
            ctx.fill();

            // Value
            ctx.fillStyle = '#f8fafc';
            ctx.font = 'bold 13px JetBrains Mono';
            ctx.textAlign = 'center';
            ctx.fillText(d.value.toString(), x + barWidth / 2, y + barH / 2);

            // Label
            ctx.fillStyle = '#94a3b8';
            ctx.font = '10px Rajdhani';
            ctx.textAlign = 'right';
            ctx.fillText(d.label, x - 8, y + barH / 2 + 4);
        });
    }

    drawBars(data1, startX, 'Átomo 1');
    drawBars(data2, startX + barWidth * 2 + gap * 3, 'Átomo 2');
}

// --- CALC 2: Concentração de Soluções ---
function calcConcentracao() {
    const massa = parseFloat(document.getElementById('c_massa').value);
    const volume = parseFloat(document.getElementById('c_volume').value);
    const volUnit = document.getElementById('c_volUnit').value;
    const mm = parseFloat(document.getElementById('c_mm').value);

    // Validation
    const fields = [
        { id: 'c_massa', val: massa }, { id: 'c_volume', val: volume }, { id: 'c_mm', val: mm }
    ];
    let valid = true;
    fields.forEach(f => {
        const el = document.getElementById(f.id);
        if (isNaN(f.val) || f.val <= 0) {
            el.classList.add('error');
            valid = false;
            setTimeout(() => el.classList.remove('error'), 1500);
        }
    });
    if (!valid) return;

    let volumeL = volUnit === 'mL' ? volume / 1000 : volume;
    let volumeML = volUnit === 'mL' ? volume : volume * 1000;

    const cComum = massa / volumeL;       // g/L
    const titulo = (massa / volumeML) * 100; // % m/V
    const cMolar = massa / (mm * volumeL);    // mol/L

    const resultsDiv = document.getElementById('concentracaoResults');
    resultsDiv.innerHTML = `
        <div class="result-item highlight">
            <div class="result-label">Concentração Comum (C)</div>
            <div class="result-value">${cComum.toFixed(4)} g/L</div>
            <div class="result-formula">C = ${massa} g ÷ ${volumeL.toFixed(4)} L</div>
        </div>
        <div class="result-item">
            <div class="result-label">Título da Solução (% m/V)</div>
            <div class="result-value">${titulo.toFixed(4)} %</div>
            <div class="result-formula">T = (${massa} g ÷ ${volumeML.toFixed(2)} mL) × 100</div>
        </div>
        <div class="result-item highlight">
            <div class="result-label">Concentração Molar (M)</div>
            <div class="result-value">${cMolar.toFixed(4)} mol/L</div>
            <div class="result-formula">M = ${massa} g ÷ (${mm} g/mol × ${volumeL.toFixed(4)} L)</div>
        </div>
    `;

    drawConcentracaoVisualization(volumeL, cMolar, cComum);
    addToHistory(`Concentração: ${cComum.toFixed(2)} g/L, ${cMolar.toFixed(4)} mol/L`);
}

function drawConcentracaoVisualization(volumeL, cMolar, cComum) {
    const canvas = document.getElementById('concentracaoCanvas');
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    // Background
    ctx.fillStyle = 'rgba(5, 2, 12, 0.5)';
    ctx.fillRect(0, 0, w, h);

    // Title
    ctx.fillStyle = '#a855f7';
    ctx.font = 'bold 13px Orbitron';
    ctx.textAlign = 'center';
    ctx.fillText('Balão Volumétrico', w / 2, 20);

    // Draw volumetric flask
    const flaskX = w / 2;
    const flaskTopY = 50;
    const flaskNeckW = 20;
    const flaskBodyW = 80;
    const flaskBodyH = 160;
    const flaskBottomY = flaskTopY + 120 + flaskBodyH;

    // Flask outline
    ctx.beginPath();
    // Neck
    ctx.moveTo(flaskX - flaskNeckW, flaskTopY);
    ctx.lineTo(flaskX - flaskNeckW, flaskTopY + 100);
    // Curve to body
    ctx.quadraticCurveTo(flaskX - flaskNeckW, flaskTopY + 120, flaskX - flaskBodyW, flaskTopY + 130);
    // Body
    ctx.lineTo(flaskX - flaskBodyW, flaskBottomY - 20);
    ctx.quadraticCurveTo(flaskX - flaskBodyW, flaskBottomY, flaskX - 10, flaskBottomY);
    ctx.lineTo(flaskX + 10, flaskBottomY);
    ctx.quadraticCurveTo(flaskX + flaskBodyW, flaskBottomY, flaskX + flaskBodyW, flaskBottomY - 20);
    ctx.lineTo(flaskX + flaskBodyW, flaskTopY + 130);
    ctx.quadraticCurveTo(flaskX + flaskNeckW, flaskTopY + 120, flaskX + flaskNeckW, flaskTopY + 100);
    ctx.lineTo(flaskX + flaskNeckW, flaskTopY);
    ctx.closePath();

    // Liquid fill (based on volume, normalized)
    const fillRatio = Math.min(volumeL / 2, 0.85); // Normalize for visual
    const fillHeight = flaskBodyH * fillRatio;
    const fillY = flaskBottomY - fillHeight;

    // Clip for liquid
    ctx.save();
    ctx.clip();

    // Liquid gradient
    const intensity = Math.min(cMolar / 2, 1);
    const liquidGrad = ctx.createLinearGradient(0, fillY, 0, flaskBottomY);
    const r = Math.round(168 + (236 - 168) * intensity);
    const g = Math.round(85 * (1 - intensity));
    const b = Math.round(247 * (1 - intensity * 0.3));
    liquidGrad.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.6)`);
    liquidGrad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0.9)`);

    ctx.fillStyle = liquidGrad;
    ctx.fillRect(flaskX - flaskBodyW - 10, fillY, (flaskBodyW + 10) * 2, flaskBottomY - fillY + 10);

    // Liquid surface wave
    ctx.beginPath();
    ctx.moveTo(flaskX - flaskBodyW, fillY);
    for (let x = flaskX - flaskBodyW; x <= flaskX + flaskBodyW; x += 2) {
        const wave = Math.sin((x - flaskX) * 0.1) * 3;
        ctx.lineTo(x, fillY + wave);
    }
    ctx.lineTo(flaskX + flaskBodyW, fillY + 10);
    ctx.lineTo(flaskX - flaskBodyW, fillY + 10);
    ctx.closePath();
    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.4)`;
    ctx.fill();

    ctx.restore();

    // Flask stroke
    ctx.beginPath();
    ctx.moveTo(flaskX - flaskNeckW, flaskTopY);
    ctx.lineTo(flaskX - flaskNeckW, flaskTopY + 100);
    ctx.quadraticCurveTo(flaskX - flaskNeckW, flaskTopY + 120, flaskX - flaskBodyW, flaskTopY + 130);
    ctx.lineTo(flaskX - flaskBodyW, flaskBottomY - 20);
    ctx.quadraticCurveTo(flaskX - flaskBodyW, flaskBottomY, flaskX - 10, flaskBottomY);
    ctx.lineTo(flaskX + 10, flaskBottomY);
    ctx.quadraticCurveTo(flaskX + flaskBodyW, flaskBottomY, flaskX + flaskBodyW, flaskBottomY - 20);
    ctx.lineTo(flaskX + flaskBodyW, flaskTopY + 130);
    ctx.quadraticCurveTo(flaskX + flaskNeckW, flaskTopY + 120, flaskX + flaskNeckW, flaskTopY + 100);
    ctx.lineTo(flaskX + flaskNeckW, flaskTopY);
    ctx.strokeStyle = 'rgba(168, 85, 247, 0.5)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Volume marks
    for (let i = 1; i <= 5; i++) {
        const markY = flaskTopY + 130 + (flaskBodyH - 40) * (1 - i / 5);
        ctx.beginPath();
        ctx.moveTo(flaskX - flaskBodyW - 8, markY);
        ctx.lineTo(flaskX - flaskBodyW + 5, markY);
        ctx.strokeStyle = 'rgba(203, 213, 225, 0.3)';
        ctx.lineWidth = 1;
        ctx.stroke();
    }

    // Info text
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '11px Rajdhani';
    ctx.textAlign = 'center';
    ctx.fillText(`V = ${volumeL.toFixed(3)} L`, w / 2, flaskBottomY + 20);
    ctx.fillText(`M = ${cMolar.toFixed(4)} mol/L`, w / 2, flaskBottomY + 38);
}

// --- CALC 3: pH ---
function calcPH() {
    const natureza = document.getElementById('ph_natureza').value;
    const forca = document.getElementById('ph_forca').value;
    const tipo = parseInt(document.getElementById('ph_tipo').value);
    const conc = parseFloat(document.getElementById('ph_conc').value);
    const method = document.querySelector('.ph-toggle-btn.active').dataset.method;

    // Validation
    const concEl = document.getElementById('ph_conc');
    if (isNaN(conc) || conc <= 0) {
        concEl.classList.add('error');
        setTimeout(() => concEl.classList.remove('error'), 1500);
        return;
    }

    let hConc, ohConc, ph, poh;

    if (method === 'alpha') {
        let alpha = parseFloat(document.getElementById('ph_alpha').value);
        if (isNaN(alpha)) alpha = forca === 'forte' ? 100 : 50;

        const alphaDec = alpha / 100;

        if (natureza === 'acido') {
            hConc = tipo * conc * alphaDec;
            ohConc = 1e-14 / hConc;
        } else {
            ohConc = tipo * conc * alphaDec;
            hConc = 1e-14 / ohConc;
        }
    } else {
        // K_a/K_b method
        const kaStr = document.getElementById('ph_ka').value;
        const ka = parseFloat(kaStr);
        if (isNaN(ka) || ka <= 0) {
            document.getElementById('ph_ka').classList.add('error');
            setTimeout(() => document.getElementById('ph_ka').classList.remove('error'), 1500);
            return;
        }

        if (natureza === 'acido') {
            // [H+]² + Ka[H+] - Ka*C₀ = 0
            // x² + Ka*x - Ka*C₀ = 0
            const discriminant = ka * ka + 4 * ka * tipo * conc;
            hConc = (-ka + Math.sqrt(discriminant)) / 2;
            ohConc = 1e-14 / hConc;
        } else {
            const discriminant = ka * ka + 4 * ka * tipo * conc;
            ohConc = (-ka + Math.sqrt(discriminant)) / 2;
            hConc = 1e-14 / ohConc;
        }
    }

    ph = -Math.log10(hConc);
    poh = -Math.log10(ohConc);

    const resultsDiv = document.getElementById('phResults');
    const phColor = ph < 7 ? '#ef4444' : ph > 7 ? '#22c55e' : '#f59e0b';
    const phLabel = ph < 7 ? 'ÁCIDO' : ph > 7 ? 'BÁSICO' : 'NEUTRO';

    resultsDiv.innerHTML = `
        <div class="result-item highlight" style="border-left-color:${phColor}">
            <div class="result-label">pH da Solução</div>
            <div class="result-value" style="color:${phColor}">${ph.toFixed(4)}</div>
            <div class="result-formula" style="color:${phColor}">${phLabel}</div>
        </div>
        <div class="result-item">
            <div class="result-label">pOH da Solução</div>
            <div class="result-value">${poh.toFixed(4)}</div>
        </div>
        <div class="result-item">
            <div class="result-label">Concentração de [H⁺]</div>
            <div class="result-value">${formatSci(hConc)} mol/L</div>
        </div>
        <div class="result-item">
            <div class="result-label">Concentração de [OH⁻]</div>
            <div class="result-value">${formatSci(ohConc)} mol/L</div>
        </div>
        <div class="result-item">
            <div class="result-label">Verificação</div>
            <div class="result-value" style="font-size:0.9rem">pH + pOH = ${(ph + poh).toFixed(4)} ≈ 14.00 ✓</div>
        </div>
    `;

    drawPHVisualization(ph);
    addToHistory(`pH: ${ph.toFixed(2)} (${phLabel})`);
}

function formatSci(n) {
    if (n >= 0.001) return n.toFixed(6);
    return n.toExponential(4);
}

function drawPHVisualization(ph) {
    const canvas = document.getElementById('phCanvas');
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    // Background
    ctx.fillStyle = 'rgba(5, 2, 12, 0.5)';
    ctx.fillRect(0, 0, w, h);

    // Title
    ctx.fillStyle = '#a855f7';
    ctx.font = 'bold 13px Orbitron';
    ctx.textAlign = 'center';
    ctx.fillText('Tubo de Ensaio — Escala de pH', w / 2, 20);

    // Draw test tube
    const tubeX = w / 2;
    const tubeTop = 45;
    const tubeBottom = h - 50;
    const tubeW = 50;
    const tubeH = tubeBottom - tubeTop;

    // pH to color
    function pHColor(p) {
        const colors = [
            { pH: 0, r: 139, g: 0, b: 0 },       // Dark red
            { pH: 2, r: 220, g: 20, b: 60 },      // Red
            { pH: 4, r: 255, g: 140, b: 0 },      // Orange
            { pH: 6, r: 255, g: 255, b: 0 },      // Yellow
            { pH: 7, r: 50, g: 205, b: 50 },      // Green
            { pH: 9, r: 0, g: 150, b: 200 },      // Blue
            { pH: 11, r: 75, g: 0, b: 130 },      // Indigo
            { pH: 14, r: 148, g: 0, b: 211 }      // Violet
        ];

        let lower = colors[0], upper = colors[colors.length - 1];
        for (let i = 0; i < colors.length - 1; i++) {
            if (p >= colors[i].pH && p <= colors[i + 1].pH) {
                lower = colors[i];
                upper = colors[i + 1];
                break;
            }
        }

        const t = (p - lower.pH) / (upper.pH - lower.pH);
        const r = Math.round(lower.r + (upper.r - lower.r) * t);
        const g = Math.round(lower.g + (upper.g - lower.g) * t);
        const b = Math.round(lower.b + (upper.b - lower.b) * t);
        return `rgb(${r}, ${g}, ${b})`;
    }

    const tubeColor = pHColor(ph);

    // Liquid fill
    const liquidRatio = 0.7;
    const liquidH = tubeH * liquidRatio;
    const liquidY = tubeBottom - liquidH;

    // Tube body
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(tubeX - tubeW / 2, tubeTop, tubeW, tubeH, [0, 0, 25, 25]);
    ctx.clip();

    // Liquid
    const liquidGrad = ctx.createLinearGradient(0, liquidY, 0, tubeBottom);
    liquidGrad.addColorStop(0, tubeColor);
    liquidGrad.addColorStop(1, tubeColor + 'cc');
    ctx.fillStyle = liquidGrad;
    ctx.fillRect(tubeX - tubeW / 2, liquidY, tubeW, tubeH);

    // Surface
    ctx.fillStyle = tubeColor + '88';
    ctx.fillRect(tubeX - tubeW / 2, liquidY, tubeW, 4);

    ctx.restore();

    // Tube outline
    ctx.beginPath();
    ctx.roundRect(tubeX - tubeW / 2, tubeTop, tubeW, tubeH, [0, 0, 25, 25]);
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Tube rim
    ctx.beginPath();
    ctx.ellipse(tubeX, tubeTop, tubeW / 2 + 4, 6, 0, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255,255,255,0.4)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // pH scale bar on the right
    const scaleX = w - 60;
    const scaleW = 15;
    const scaleH = tubeH;
    const scaleY = tubeTop;

    for (let i = 0; i <= 100; i++) {
        const p = 14 - (i / 100) * 14;
        const y = scaleY + (i / 100) * scaleH;
        ctx.fillStyle = pHColor(p);
        ctx.fillRect(scaleX, y, scaleW, 2);
    }

    // Scale labels
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '10px JetBrains Mono';
    ctx.textAlign = 'left';
    for (let p = 0; p <= 14; p += 2) {
        const y = scaleY + ((14 - p) / 14) * scaleH;
        ctx.fillText(p.toString(), scaleX + scaleW + 4, y + 4);
    }

    // Indicator line
    const indicatorY = scaleY + ((14 - ph) / 14) * scaleH;
    ctx.beginPath();
    ctx.moveTo(scaleX - 10, indicatorY);
    ctx.lineTo(scaleX, indicatorY);
    ctx.strokeStyle = '#f8fafc';
    ctx.lineWidth = 2;
    ctx.stroke();

    // pH value
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 16px Orbitron';
    ctx.textAlign = 'center';
    ctx.fillText(`pH = ${ph.toFixed(2)}`, w / 2, h - 10);
}

// --- CALC 4: Titulação ---
function calcTitulacao() {
    const xA = parseInt(document.getElementById('t_valA').value) || 1;
    const xB = parseInt(document.getElementById('t_valB').value) || 1;
    const mA = parseFloat(document.getElementById('t_mA').value);
    const vA = parseFloat(document.getElementById('t_vA').value);
    const mB = parseFloat(document.getElementById('t_mB').value);
    const kaStr = document.getElementById('t_ka').value;
    const ka = kaStr ? parseFloat(kaStr) : null;

    // Validation
    const fields = [
        { id: 't_mA', val: mA }, { id: 't_vA', val: vA }, { id: 't_mB', val: mB }
    ];
    let valid = true;
    fields.forEach(f => {
        const el = document.getElementById(f.id);
        if (isNaN(f.val) || f.val <= 0) {
            el.classList.add('error');
            valid = false;
            setTimeout(() => el.classList.remove('error'), 1500);
        }
    });
    if (!valid) return;

    // M_A * V_A * x_A = M_B * V_B * x_B
    const vB = (mA * vA * xA) / (mB * xB);

    const resultsDiv = document.getElementById('titulacaoResults');
    resultsDiv.innerHTML = `
        <div class="result-item highlight">
            <div class="result-label">Equação de Neutralização</div>
            <div class="result-value" style="font-size:0.9rem">M_A × V_A × x_A = M_B × V_B × x_B</div>
        </div>
        <div class="result-item">
            <div class="result-label">Dados do Ácido</div>
            <div class="result-value" style="font-size:0.85rem">M_A = ${mA} mol/L | V_A = ${vA} mL | x_A = ${xA}</div>
        </div>
        <div class="result-item">
            <div class="result-label">Dados da Base</div>
            <div class="result-value" style="font-size:0.85rem">M_B = ${mB} mol/L | x_B = ${xB}</div>
        </div>
        <div class="result-item highlight">
            <div class="result-label">Volume de Base Necessário (V_B)</div>
            <div class="result-value">${vB.toFixed(4)} mL</div>
            <div class="result-formula">V_B = (${mA} × ${vA} × ${xA}) ÷ (${mB} × ${xB})</div>
        </div>
        <div class="result-item">
            <div class="result-label">Ponto de Equivalência</div>
            <div class="result-value" style="font-size:0.85rem">n(H⁺) = ${mA * vA * xA / 1000} mol = n(OH⁻) = ${mB * vB * xB / 1000} mol ✓</div>
        </div>
    `;

    drawTitulacaoCurve(mA, vA, mB, xA, xB, ka);
    addToHistory(`Titulação: V_B = ${vB.toFixed(2)} mL`);
}

function drawTitulacaoCurve(mA, vA, mB, xA, xB, ka) {
    const canvas = document.getElementById('titulacaoCanvas');
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    // Background
    ctx.fillStyle = 'rgba(5, 2, 12, 0.5)';
    ctx.fillRect(0, 0, w, h);

    // Title
    ctx.fillStyle = '#a855f7';
    ctx.font = 'bold 13px Orbitron';
    ctx.textAlign = 'center';
    ctx.fillText('Curva de Titulação (pH vs Volume)', w / 2, 20);

    // Chart area
    const margin = { top: 35, right: 30, bottom: 45, left: 55 };
    const chartW = w - margin.left - margin.right;
    const chartH = h - margin.top - margin.bottom;

    // Calculate equivalence volume
    const vB_eq = (mA * vA * xA) / (mB * xB);
    const maxV = vB_eq * 2.5;
    const isStrong = !ka || ka > 0.1;

    // Calculate pH at various volumes
    const points = [];
    const steps = 200;
    for (let i = 0; i <= steps; i++) {
        const vB_added = (i / steps) * maxV;
        let pH;

        const molesHA = mA * vA / 1000 * xA;
        const molesOH = mB * vB_added / 1000 * xB;
        const totalVol = (vA + vB_added) / 1000;

        if (vB_added === 0) {
            if (isStrong) {
                pH = -Math.log10(mA * xA);
            } else {
                // Weak acid: [H+] ≈ sqrt(Ka * C)
                pH = -Math.log10(Math.sqrt(ka * mA));
            }
        } else if (molesOH < molesHA) {
            // Before equivalence
            if (isStrong) {
                const remainingH = (molesHA - molesOH) / totalVol;
                pH = -Math.log10(remainingH);
            } else {
                // Buffer region - Henderson-Hasselbalch
                const remainingHA = molesHA - molesOH;
                const formedA = molesOH;
                const pKa = -Math.log10(ka);
                pH = pKa + Math.log10(formedA / remainingHA);
            }
        } else if (Math.abs(molesOH - molesHA) < 1e-10) {
            // At equivalence
            if (isStrong) {
                pH = 7;
            } else {
                // Salt hydrolysis
                const saltConc = molesHA / totalVol;
                pH = 7 + 0.5 * (-Math.log10(ka)) + 0.5 * Math.log10(saltConc);
            }
        } else {
            // After equivalence
            const excessOH = (molesOH - molesHA) / totalVol;
            const pOH = -Math.log10(excessOH);
            pH = 14 - pOH;
        }

        // Clamp pH
        pH = Math.max(0, Math.min(14, pH));
        points.push({ v: vB_added, pH });
    }

    // Draw axes
    ctx.beginPath();
    ctx.moveTo(margin.left, margin.top);
    ctx.lineTo(margin.left, h - margin.bottom);
    ctx.lineTo(w - margin.right, h - margin.bottom);
    ctx.strokeStyle = 'rgba(203, 213, 225, 0.4)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Y-axis labels (pH 0-14)
    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px JetBrains Mono';
    ctx.textAlign = 'right';
    for (let pH = 0; pH <= 14; pH += 2) {
        const y = margin.top + chartH - (pH / 14) * chartH;
        ctx.fillText(pH.toString(), margin.left - 8, y + 4);

        // Grid line
        ctx.beginPath();
        ctx.moveTo(margin.left, y);
        ctx.lineTo(w - margin.right, y);
        ctx.strokeStyle = 'rgba(168, 85, 247, 0.08)';
        ctx.lineWidth = 0.5;
        ctx.stroke();
    }

    // X-axis labels
    ctx.textAlign = 'center';
    const vStep = maxV / 5;
    for (let i = 0; i <= 5; i++) {
        const v = i * vStep;
        const x = margin.left + (v / maxV) * chartW;
        ctx.fillText(v.toFixed(0) + ' mL', x, h - margin.bottom + 18);
    }

    // Axis labels
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '11px Rajdhani';
    ctx.textAlign = 'center';
    ctx.fillText('Volume de Base (mL)', margin.left + chartW / 2, h - 5);

    ctx.save();
    ctx.translate(15, margin.top + chartH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('pH', 0, 0);
    ctx.restore();

    // Draw curve
    ctx.beginPath();
    points.forEach((p, i) => {
        const x = margin.left + (p.v / maxV) * chartW;
        const y = margin.top + chartH - (p.pH / 14) * chartH;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    });

    const curveGrad = ctx.createLinearGradient(0, margin.top, 0, h - margin.bottom);
    curveGrad.addColorStop(0, '#ef4444');
    curveGrad.addColorStop(0.5, '#a855f7');
    curveGrad.addColorStop(1, '#22c55e');
    ctx.strokeStyle = curveGrad;
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Equivalence point marker
    const eqX = margin.left + (vB_eq / maxV) * chartW;
    const eqY = margin.top + chartH - (7 / 14) * chartH;

    ctx.beginPath();
    ctx.arc(eqX, eqY, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#f59e0b';
    ctx.fill();
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 10px Orbitron';
    ctx.textAlign = 'left';
    ctx.fillText(`Eq: ${vB_eq.toFixed(1)} mL`, eqX + 10, eqY - 5);

    // Glow effect
    ctx.shadowColor = '#a855f7';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    points.forEach((p, i) => {
        const x = margin.left + (p.v / maxV) * chartW;
        const y = margin.top + chartH - (p.pH / 14) * chartH;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = 'rgba(168, 85, 247, 0.3)';
    ctx.lineWidth = 6;
    ctx.stroke();
    ctx.shadowBlur = 0;
}

// ===== LIBRARY =====
const ARTICLES = {
    1: {
        title: 'A Tabela Periódica',
        meta: 'Química Geral — Elementos e Propriedades Periódicas',
        content: `
            <h2>Introdução</h2>
            <p>A <strong>Tabela Periódica dos Elementos Químicos</strong> é uma organização tabular dos elementos químicos, ordenada por número atômico (Z), configuração eletrônica e recorrentes propriedades químicas. Sua estrutura exibe padrões periódicos que são fundamentais para compreender o comportamento dos elementos.</p>

            <h2>Histórico</h2>
            <p>O desenvolvimento da tabela periódica foi um processo gradual:</p>
            <ul>
                <li><strong>1869 — Dmitri Mendeleev:</strong> Publicou a primeira tabela periódica significativa, organizando os elementos por massa atômica e prevendo a existência de elementos ainda não descobertos (como o germânio e o escândio).</li>
                <li><strong>1871 — Lothar Meyer:</strong> Independentemente, chegou a uma organização semelhante, focando nas propriedades físicas.</li>
                <li><strong>1913 — Henry Moseley:</strong> Demonstrou que a propriedade fundamental de ordenação é o <strong>número atômico (Z)</strong>, não a massa atômica, resolvendo as inconsistências da tabela de Mendeleev.</li>
                <li><strong>1969 — Glenn Seaborg:</strong> Propôs a separação dos lantanídeos e actinídeos em séries separadas.</li>
            </ul>

            <h2>Estrutura da Tabela</h2>
            <p>A tabela periódica moderna possui:</p>
            <ul>
                <li><strong>18 Grupos (colunas verticais):</strong> Elementos do mesmo grupo compartilham configuração eletrônica de valência e, portanto, propriedades químicas semelhantes.</li>
                <li><strong>7 Períodos (linhas horizontais):</strong> Cada período corresponde ao preenchimento de uma nova camada eletrônica principal.</li>
                <li><strong>Séries f (Lantanídeos e Actinídeos):</strong> Colocadas separadamente na parte inferior para manter a tabela compacta.</li>
            </ul>

            <h2>Nomenclatura dos Grupos</h2>
            <p>Os grupos possuem nomenclatura específica:</p>
            <ul>
                <li><strong>Grupo 1:</strong> Metais Alcalinos (Li, Na, K, Rb, Cs, Fr)</li>
                <li><strong>Grupo 2:</strong> Metais Alcalino-Terrosos (Be, Mg, Ca, Sr, Ba, Ra)</li>
                <li><strong>Grupos 3-12:</strong> Metais de Transição</li>
                <li><strong>Grupo 17:</strong> Halogênios (F, Cl, Br, I, At)</li>
                <li><strong>Grupo 18:</strong> Gases Nobres (He, Ne, Ar, Kr, Xe, Rn, Og)</li>
            </ul>

            <h2>Exceções Notáveis</h2>
            <p>O <strong>Hidrogênio (H)</strong> é um caso especial: embora esteja no Grupo 1, não é um metal alcalino. Possui propriedades únicas que o tornam distinto de todos os demais elementos.</p>
            <p>O <strong>Hélio (He)</strong> possui configuração 1s² (2 elétrons de valência), mas é classificado como gás nobre (Grupo 18) por sua estabilidade química e camada completa.</p>

            <h2>Propriedades Periódicas</h2>
            <h3>Raio Atômico</h3>
            <p>Aumenta da <strong>direita para a esquerda</strong> em um período e de <strong>cima para baixo</strong> em um grupo. O tamanho do átomo depende do número de camadas eletrônicas e da carga nuclear efetiva.</p>

            <h3>Eletronegatividade</h3>
            <p>Aumenta da <strong>esquerda para a direita</strong> em um período e de <strong>baixo para cima</strong> em um grupo. O Flúor (F) é o elemento mais eletronegativo (3,98 na escala de Pauling).</p>

            <h3>Energia de Ionização</h3>
            <p>Segue o mesmo padrão da eletronegatividade: aumenta da esquerda para a direita e de baixo para cima. Representa a energia necessária para remover um elétron do átomo no estado gasoso.</p>

            <h3>Afinidade Eletrônica</h3>
            <p>É a energia liberada quando um átomo no estado gasoso captura um elétron. Em geral, aumenta da esquerda para a direita em um período.</p>

            <h3>Eletropositividade</h3>
            <p>Tendência do átomo em perder elétrons. É o inverso da eletronegatividade: aumenta da direita para a esquerda e de cima para baixo.</p>

            <div class="reference-block">
                <h4>📖 Referências Bibliográficas</h4>
                <p>• BRITT, D. S.; RUSSO, N. S.; MURPHY, C. K. <em>Química Geral e Estrutura Atômica.</em> 2ª ed. Rio de Janeiro: LTC, 2007.</p>
                <p>• MOORE, J. W.; stanitski, M. T. <em>Química: Teoria e Prática.</em> São Paulo: Cengage Learning, 2013.</p>
                <p>• ZUMDAL, S. S. <em>Chemical Principles.</em> 8th ed. Boston: Cengage Learning, 2016.</p>
            </div>
        `
    },
    2: {
        title: 'Ligações Químicas e Polaridade',
        meta: 'Química Geral — Interações entre Átomos',
        content: `
            <h2>Introdução</h2>
            <p>As <strong>ligações químicas</strong> são forças de atração que mantêm os átomos unidos formando moléculas e compostos. A compreensão dessas ligações é essencial para explicar as propriedades das substâncias.</p>

            <h2>Teoria do Octeto</h2>
            <p>Proposta por <strong>Gilbert N. Lewis</strong> em 1916, a teoria do octeto estabelece que os átomos tendem a ganhar, perder ou compartilhar elétrons para atingir a configuração eletrônica de um gás nobre (8 elétrons na camada de valência).</p>

            <div class="formula-block">
                Regra do Octeto: Átomos buscam 8 elétrons na camada de valência<br>
                Exceção do Dueto: H e He buscam 2 elétrons
            </div>

            <h2>Tipos de Ligações</h2>
            <h3>Ligação Iônica</h3>
            <p>Ocorre por <strong>transferência de elétrons</strong> de um átomo (geralmente metal) para outro (geralmente não-metal). Forma-se um cátion e um ânion, que se atraem eletrostaticamente.</p>
            <p><strong>Exemplo:</strong> NaCl — O sódio (Na) transfere 1 elétron para o cloro (Cl), formando Na⁺ e Cl⁻.</p>

            <h3>Ligação Covalente</h3>
            <p>Ocorre por <strong>compartilhamento de elétrons</strong> entre átomos (geralmente não-metais). Pode ser:</p>
            <ul>
                <li><strong>Simples:</strong> 1 par compartilhado (ex: H—H)</li>
                <li><strong>Dupla:</strong> 2 pares compartilhados (ex: O=O)</li>
                <li><strong>Tripla:</strong> 3 pares compartilhados (ex: N≡N)</li>
            </ul>

            <h3>Ligação Metálica</h3>
            <p>Ocorre entre átomos de metais. Os elétrons de valência formam um <strong>"mar de elétrons"</strong> deslocalizados, enquanto os cátions metálicos permanecem fixos em posições regulares. Explica a condutividade elétrica, maleabilidade e brilho metálico.</p>

            <h2>Exceções à Regra do Octeto</h2>
            <ul>
                <li><strong>Incompleta:</strong> Boro (BF₃) e Berílio (BeCl₂) possuem menos de 8 elétrons.</li>
                <li><strong>Expandida (Hipervalência):</strong> Elementos do 3º período ou superior podem ter mais de 8 elétrons (ex: PCl₅, SF₆).</li>
                <li><strong>Radicais Livres:</strong> Moléculas com elétron desemparelhado (ex: NO, ClO₂).</li>
            </ul>

            <h2>Geometria Molecular — Teoria VSEPR</h2>
            <p>A <strong>Teoria da Repulsão dos Pares Eletrônicos da Camada de Valência (VSEPR)</strong> prevê a geometria das moléculas com base na repulsão entre os pares de elétrons (ligantes e livres) ao redor do átomo central.</p>
            <ul>
                <li><strong>2 domínios:</strong> Linear (180°) — ex: CO₂</li>
                <li><strong>3 domínios:</strong> Trigonal plana (120°) — ex: BF₃</li>
                <li><strong>4 domínios:</strong> Tetraédrica (109,5°) — ex: CH₄</li>
                <li><strong>5 domínios:</strong> Bipirâmide trigonal (90°/120°) — ex: PCl₅</li>
                <li><strong>6 domínios:</strong> Octaédrica (90°) — ex: SF₆</li>
            </ul>

            <h2>Polaridade das Moléculas</h2>
            <p>Uma molécula é <strong>polar</strong> quando possui momento dipolar resultante diferente de zero. Isso depende:</p>
            <ol>
                <li>Da <strong>polaridade das ligações</strong> (diferença de eletronegatividade)</li>
                <li>Da <strong>geometria molecular</strong> (simetria)</li>
            </ol>
            <p><strong>Exemplos:</strong> H₂O é polar (angular), CO₂ é apolar (linear, dipolos se cancelam).</p>

            <div class="reference-block">
                <h4>📖 Referências Bibliográficas</h4>
                <p>• ATKINS, P.; JONES, L. <em>Princípios de Química: Questionando a Vida Moderna e o Meio Ambiente.</em> 5ª ed. Porto Alegre: Bookman, 2012.</p>
                <p>• PETRUCCI, R. H. et al. <em>Química Geral e Química Inorgânica.</em> 8ª ed. São Paulo: Pearson, 2015.</p>
                <p>• WOLCOTT, C. H. <em>Química: Conceitos Fundamentais.</em> São Paulo: Thomson, 2006.</p>
            </div>
        `
    },
    3: {
        title: 'Solubilidade e Misturas',
        meta: 'Química Geral — Sistemas Multicomponentes',
        content: `
            <h2>Introdução</h2>
            <p>As <strong>misturas</strong> são combinações de duas ou mais substâncias que mantêm suas propriedades individuais. O estudo das misturas é fundamental em química, pois a grande maioria das substâncias que encontramos no dia a dia são misturas.</p>

            <h2>Conceitos Fundamentais</h2>
            <ul>
                <li><strong>Soluto:</strong> Substância que está em menor quantidade e que se dissolve.</li>
                <li><strong>Solvente:</strong> Substância que está em maior quantidade e que dissolve o soluto.</li>
                <li><strong>Solução:</strong> Mistura homogênea de soluto(s) em solvente.</li>
                <li><strong>Água:</strong> Conhecida como "solvente universal" por sua capacidade de dissolver uma grande variedade de substâncias.</li>
            </ul>

            <h2>Limite de Solubilidade</h2>
            <p>O <strong>limite de solubilidade</strong> é a quantidade máxima de soluto que pode ser dissolvida em uma determinada quantidade de solvente, a uma temperatura e pressão específicas.</p>
            <ul>
                <li><strong>Solução Insaturada:</strong> Concentração abaixo do limite de solubilidade.</li>
                <li><strong>Solução Saturada:</strong> Concentração igual ao limite de solubilidade (equilíbrio dinâmico).</li>
                <li><strong>Solução Supersaturada:</strong> Concentração acima do limite (estado metastável, obtida por resfriamento cuidadoso).</li>
            </ul>

            <h2>Fatores que Influenciam a Solubilidade</h2>
            <h3>Temperatura</h3>
            <ul>
                <li><strong>Sólidos em líquidos:</strong> Em geral, a solubilidade <strong>aumenta</strong> com a temperatura (processo endotérmico).</li>
                <li><strong>Gases em líquidos:</strong> A solubilidade <strong>diminui</strong> com o aumento da temperatura (processo exotérmico).</li>
            </ul>

            <h3>Pressão</h3>
            <ul>
                <li><strong>Gases em líquidos:</strong> A solubilidade aumenta com a pressão (Lei de Henry: S = k_H × P).</li>
                <li><strong>Sólidos e líquidos:</strong> A pressão tem efeito desprezível na solubilidade.</li>
            </ul>

            <h3>Natureza do Soluto e Solvente</h3>
            <p>"Semelhante dissolve semelhante": solventes polares dissolvem solutos polares; solventes apolares dissolvem solutos apolares.</p>

            <h2>Tipos de Misturas</h2>
            <h3>Misturas Homogêneas (1 fase)</h3>
            <p>Componentes não são visíveis a olho nu. Exemplos: solução de sal em água, ar, álcool hidratado.</p>

            <h3>Misturas Heterogêneas (2+ fases)</h3>
            <p>Componentes são visíveis e podem ser separados por métodos físicos. Exemplos: água e óleo, areia e água, granito.</p>

            <h2>Métodos de Separação</h2>
            <ul>
                <li><strong>Filtração simples:</strong> Sólido + líquido (ex: areia + água)</li>
                <li><strong>Decantação:</strong> Líquidos imiscíveis (ex: óleo + água)</li>
                <li><strong>Destilação simples:</strong> Sólido + líquido volátil (ex: sal + água)</li>
                <li><strong>Destilação fracionada:</strong> Líquidos voláteis com diferentes pontos de ebulição (ex: petróleo)</li>
                <li><strong>Evaporação:</strong> Sólido + líquido (recuperação do soluto)</li>
                <li><strong>Cromatografia:</strong> Separação de componentes por diferentes taxas de migração</li>
            </ul>

            <div class="reference-block">
                <h4>📖 Referências Bibliográficas</h4>
                <p>• GRIMALDI, O. <em>Química: Misturas e Soluções.</em> 3ª ed. São Paulo: Moderna, 2014.</p>
                <p>• FOLHA, F. F. <em>Química para o Ensino Médio.</em> Vol. 1. São Paulo: Ática, 2011.</p>
                <p>• BROWN, T. L.; LEMAY, H. E.; BURDEN, B. <em>Química: A Ciência Central.</em> 12ª ed. Rio de Janeiro: Pearson, 2016.</p>
            </div>
        `
    },
    4: {
        title: 'Preparo de Soluções e Concentrações',
        meta: 'Química Geral — Volumetria e Concentração',
        content: `
            <h2>Introdução</h2>
            <p>O <strong>preparo de soluções</strong> é uma operação fundamental em laboratório. Conhecer as relações matemáticas entre as diferentes formas de expressar concentração é essencial para o correto preparo e uso de soluções.</p>

            <h2>Preparo Experimental</h2>
            <p>Para preparar uma solução com concentração desejada:</p>
            <ol>
                <li><strong>Calcular</strong> a massa de soluto necessária.</li>
                <li><strong>Pesar</strong> o soluto em balança analítica.</li>
                <li><strong>Dissolver</strong> o soluto em volume parcial de solvente (menos que o volume final).</li>
                <li><strong>Transferir</strong> para balão volumétrico de volume adequado.</li>
                <li><strong>Completar</strong> o volume com solvente até a marca de aferição.</li>
                <li><strong>Homogeneizar</strong> invertendo o balão várias vezes.</li>
            </ol>

            <h2>Concentração Comum (C)</h2>
            <p>Expressa a massa de soluto (em gramas) por volume de solução (em litros).</p>
            <div class="formula-block">
                C = m_soluto / V_solução<br>
                Unidade: g/L
            </div>
            <p><strong>Exemplo:</strong> Dissolvendo 10 g de NaCl em 500 mL de água:</p>
            <div class="formula-block">
                C = 10 g / 0,5 L = 20 g/L
            </div>

            <h2>Título da Solução (% m/V)</h2>
            <p>Expressa a massa de soluto (em gramas) por 100 mL de solução.</p>
            <div class="formula-block">
                T = (m_soluto / V_solução_mL) × 100<br>
                Unidade: % m/V (gramas por 100 mL)
            </div>

            <h2>Concentração Molar (Molaridade, M)</h2>
            <p>Expressa o número de mols de soluto por litro de solução.</p>
            <div class="formula-block">
                M = n_soluto / V_solução = m_soluto / (MM × V_solução)<br>
                Unidade: mol/L (M)
            </div>
            <p>Onde MM é a massa molar do soluto (g/mol).</p>

            <h2>Relações entre as Concentrações</h2>
            <div class="formula-block">
                C (g/L) = M (mol/L) × MM (g/mol)<br>
                T (% m/V) = C (g/L) / 10
            </div>

            <h2>Diluição de Soluções</h2>
            <p>Na diluição, adiciona-se solvente, mantendo-se constante a quantidade de soluto:</p>
            <div class="formula-block">
                C₁ × V₁ = C₂ × V₂<br>
                M₁ × V₁ = M₂ × V₂
            </div>
            <p>Onde os índices 1 e 2 referem-se à solução concentrada e diluída, respectivamente.</p>

            <div class="reference-block">
                <h4>📖 Referências Bibliográficas</h4>
                <p>• RUSSEL, J. B. <em>Química Geral.</em> Vol. 1. 4ª ed. São Paulo: Pearson, 2010.</p>
                <p>• JARDIM, W. C. <em>Química: Teoria e Resolução.</em> São Paulo: FTD, 2015.</p>
                <p>• SKOOG, D. A.; WEST, D. M.; HOLLER, F. J. <em>Fundamentos de Química Analítica.</em> 8ª ed. Cengage Learning, 2014.</p>
            </div>
        `
    },
    5: {
        title: 'Dissociação da Água',
        meta: 'Química Geral — Equilíbrio Iônico na Água',
        content: `
            <h2>Introdução</h2>
            <p>A água pura não é completamente molecular — ocorre um processo de <strong>autoionização</strong> (ou autodissociação) em que moléculas de água reagem entre si, produzindo íons hidrônio (H₃O⁺) e hidroxila (OH⁻).</p>

            <h2>Equação de Autoionização</h2>
            <div class="formula-block">
                2 H₂O(l) ⇌ H₃O⁺(aq) + OH⁻(aq)<br>
                Simplificado: H₂O(l) ⇌ H⁺(aq) + OH⁻(aq)
            </div>

            <h2>Constante de Ionização da Água (K_w)</h2>
            <p>A constante de equilíbrio para a autoionização da água é denominada <strong>K_w</strong>:</p>
            <div class="formula-block">
                K_w = [H⁺] × [OH⁻]<br>
                A 25°C: K_w = 1,0 × 10⁻¹⁴
            </div>

            <h2>Concentrações na Água Pura</h2>
            <p>Como a ionização produz H⁺ e OH⁻ em proporção 1:1:</p>
            <div class="formula-block">
                [H⁺] = [OH⁻] = √(1,0 × 10⁻¹⁴) = 1,0 × 10⁻⁷ mol/L
            </div>
            <p>Portanto, na água pura a 25°C: <strong>pH = pOH = 7,0</strong> (neutro).</p>

            <h2>Efeito da Temperatura</h2>
            <p>A autoionização da água é um processo <strong>endotérmico</strong>. Com o aumento da temperatura:</p>
            <ul>
                <li>O valor de K_w <strong>aumenta</strong></li>
                <li>[H⁺] e [OH⁻] aumentam igualmente</li>
                <li>O pH neutro <strong>diminui</strong> (mas a água continua neutra, pois [H⁺] = [OH⁻])</li>
            </ul>

            <h3>Valores de K_w em diferentes temperaturas:</h3>
            <ul>
                <li>0°C: K_w = 0,11 × 10⁻¹⁴ → pH neutro ≈ 7,47</li>
                <li>25°C: K_w = 1,0 × 10⁻¹⁴ → pH neutro = 7,00</li>
                <li>50°C: K_w = 5,48 × 10⁻¹⁴ → pH neutro ≈ 6,63</li>
                <li>100°C: K_w = 51,3 × 10⁻¹⁴ → pH neutro ≈ 6,14</li>
            </ul>

            <h2>Escala de pH</h2>
            <div class="formula-block">
                pH = -log[H⁺]<br>
                pOH = -log[OH⁻]<br>
                pH + pOH = 14,00 (a 25°C)
            </div>
            <ul>
                <li><strong>pH &lt; 7:</strong> Solução ácida ([H⁺] &gt; [OH⁻])</li>
                <li><strong>pH = 7:</strong> Solução neutra ([H⁺] = [OH⁻])</li>
                <li><strong>pH &gt; 7:</strong> Solução básica ([H⁺] &lt; [OH⁻])</li>
            </ul>

            <div class="reference-block">
                <h4>📖 Referências Bibliográficas</h4>
                <p>• ATKINS, P.; JONES, L. <em>Princípios de Química.</em> 5ª ed. Porto Alegre: Bookman, 2012.</p>
                <p>• MOORE, J. W.; STANITSKI, M. T. <em>Química: Teoria e Prática.</em> São Paulo: Cengage, 2013.</p>
                <p>• RUSSEL, J. B. <em>Química Geral.</em> Vol. 2. 4ª ed. São Paulo: Pearson, 2010.</p>
            </div>
        `
    },
    6: {
        title: 'Ácidos e Bases',
        meta: 'Química Geral — Teorias Ácido-Base',
        content: `
            <h2>Introdução</h2>
            <p>Ácidos e bases são duas das classes mais importantes de compostos químicos. Diferentes teorias foram propostas ao longo do tempo para definir e classificar essas substâncias.</p>

            <h2>Teoria de Arrhenius (1884)</h2>
            <p>A teoria mais básica, proposta por <strong>Svante Arrhenius</strong>:</p>
            <ul>
                <li><strong>Ácido de Arrhenius:</strong> Substância que, em solução aquosa, libera H⁺ (íon hidrogênio/hidrônio). Ex: HCl → H⁺ + Cl⁻</li>
                <li><strong>Base de Arrhenius:</strong> Substância que, em solução aquosa, libera OH⁻ (íon hidroxila). Ex: NaOH → Na⁺ + OH⁻</li>
            </ul>
            <p><em>Limitação:</em> Só se aplica a soluções aquosas.</p>

            <h2>Teoria de Brønsted-Lowry (1923)</h2>
            <p>Proposta independentemente por <strong>Brønsted</strong> e <strong>Lowry</strong>:</p>
            <ul>
                <li><strong>Ácido:</strong> Doador de prótons (H⁺).</li>
                <li><strong>Base:</strong> Aceitador de prótons (H⁺).</li>
            </ul>
            <p>Esta teoria introduz o conceito de <strong>pares conjugados</strong>:</p>
            <div class="formula-block">
                HA + H₂O ⇌ H₃O⁺ + A⁻<br>
                Ácido (HA) ↔ Base conjugada (A⁻)<br>
                Base (H₂O) ↔ Ácido conjugado (H₃O⁺)
            </div>

            <h2>Teoria de Lewis (1923)</h2>
            <p>Proposta por <strong>Gilbert N. Lewis</strong> — a mais abrangente:</p>
            <ul>
                <li><strong>Ácido de Lewis:</strong> Aceitador de par de elétrons.</li>
                <li><strong>Base de Lewis:</strong> Doador de par de elétrons.</li>
            </ul>
            <p><strong>Exemplo:</strong> BF₃ (ácido de Lewis) + :NH₃ (base de Lewis) → F₃B←NH₃</p>

            <h2>Força de Ácidos e Bases</h2>
            <h3>Ácidos Fortes</h3>
            <p>Ionizam-se completamente em água (α = 100%). Os principais ácidos fortes são:</p>
            <div class="formula-block">
                HCl, HBr, HI, HNO₃, H₂SO₄, HClO₄
            </div>

            <h3>Ácidos Fracos</h3>
            <p>Ionizam-se parcialmente em água (α &lt; 100%). Exemplos: CH₃COOH (ácido acético), HCN (ácido cianídrico), HF (ácido fluorídrico).</p>

            <h2>Constantes de Ionização</h2>
            <div class="formula-block">
                Para ácidos: Ka = [H⁺][A⁻] / [HA]<br>
                Para bases: Kb = [OH⁻][BH⁺] / [B]<br>
                pKa = -log(Ka) | pKb = -log(Kb)<br>
                pKa + pKb = 14 (a 25°C)
            </div>
            <p>Quanto <strong>maior</strong> o Ka (ou menor o pKa), <strong>mais forte</strong> é o ácido.</p>

            <h2>Grau de Ionização (α)</h2>
            <div class="formula-block">
                α = (nº de moléculas ionizadas) / (nº total de moléculas) × 100%
            </div>

            <div class="reference-block">
                <h4>📖 Referências Bibliográficas</h4>
                <p>• PETRUCCI, R. H. et al. <em>Química Geral e Química Inorgânica.</em> 8ª ed. São Paulo: Pearson, 2015.</p>
                <p>• ATKINS, P.; JONES, L. <em>Princípios de Química.</em> 5ª ed. Porto Alegre: Bookman, 2012.</p>
                <p>• JARDIM, W. C. <em>Química: Teoria e Resolução.</em> São Paulo: FTD, 2015.</p>
            </div>
        `
    },
    7: {
        title: 'Neutralização e Titulação',
        meta: 'Química Geral — Volumetria de Neutralização',
        content: `
            <h2>Introdução</h2>
            <p>A <strong>reação de neutralização</strong> é o processo químico no qual um ácido reage com uma base, produzindo sal e água. A <strong>titulação</strong> é a técnica analítica utilizada para determinar a concentração de uma solução desconhecida.</p>

            <h2>Equação Geral de Neutralização</h2>
            <div class="formula-block">
                Ácido + Base → Sal + Água<br>
                H⁺(aq) + OH⁻(aq) → H₂O(l)
            </div>

            <h2>Estequiometria da Neutralização</h2>
            <p>Para um ácido HₓA e uma base BOHᵧ:</p>
            <div class="formula-block">
                M_A × V_A × x_A = M_B × V_B × x_B
            </div>
            <p>Onde:</p>
            <ul>
                <li>M_A, M_B = Concentrações molares (mol/L)</li>
                <li>V_A, V_B = Volumes (mesma unidade)</li>
                <li>x_A = Nº de H⁺ ionizáveis do ácido (valência)</li>
                <li>x_B = Nº de OH⁻ ionizáveis da base (valência)</li>
            </ul>

            <h2>Volumetria de Neutralização (Titulação)</h2>
            <p>Na titulação, uma solução de concentração conhecida (titulante) é adicionada gradualmente a uma solução de concentração desconhecida (analito), até o <strong>ponto de equivalência</strong>.</p>

            <h3>Componentes do Equipamento:</h3>
            <ul>
                <li><strong>Bureta:</strong> Cilindro calibrado para dispensar volumes precisos do titulante.</li>
                <li><strong>Erlenmeyer:</strong> Recipiente que contém o analito + indicador.</li>
                <li><strong>Indicador ácido-base:</strong> Substância que muda de cor em determinada faixa de pH.</li>
            </ul>

            <h3>Indicadores Comuns:</h3>
            <ul>
                <li><strong>Fenolftaleína:</strong> Incolor (pH &lt; 8,2) → Rosa (pH &gt; 10)</li>
                <li><strong>Alaranjado de metila:</strong> Vermelho (pH &lt; 3,1) → Amarelo (pH &gt; 4,4)</li>
                <li><strong>Bromotimol azul:</strong> Amarelo (pH &lt; 6,0) → Azul (pH &gt; 7,6)</li>
                <li><strong>Timol蓝 (Timol Blue):</strong> Vermelho (pH &lt; 1,2) → Amarelo (pH 2,8-8,0) → Azul (pH &gt; 8,0)</li>
            </ul>

            <h2>Curvas de Titulação</h2>
            <p>A <strong>curva de titulação</strong> é o gráfico de pH em função do volume de titulante adicionado. Apresenta forma <strong>sigmoidal</strong> (em S), com uma região de mudança brusca de pH próxima ao ponto de equivalência.</p>

            <h3>Tipos de Curvas:</h3>
            <ul>
                <li><strong>Ácido Forte + Base Forte:</strong> Ponto de equivalência em pH = 7,0</li>
                <li><strong>Ácido Fraco + Base Forte:</strong> Ponto de equivalência em pH &gt; 7,0 (sal básico)</li>
                <li><strong>Ácido Forte + Base Fraca:</strong> Ponto de equivalência em pH &lt; 7,0 (sal ácido)</li>
            </ul>

            <h3>Regiões da Curva:</h3>
            <ul>
                <li><strong>Região inicial:</strong> pH determinado pelo analito puro.</li>
                <li><strong>Região de amortecimento (tampão):</strong> Mudança lenta de pH (para ácidos/bases fracos).</li>
                <li><strong>Ponto de equivalência:</strong> Mudança brusca de pH (salto de pH).</li>
                <li><strong>Região pós-equivalência:</strong> pH determinado pelo excesso de titulante.</li>
            </ul>

            <h2>Ponto de Equivalência vs. Ponto Final</h2>
            <ul>
                <li><strong>Ponto de equivalência:</strong> Momento exato em que n(H⁺) = n(OH⁻). É teórico.</li>
                <li><strong>Ponto final:</strong> Momento em que o indicador muda de cor. Deve coincidir com o ponto de equivalência.</li>
            </ul>
            <p>A escolha correta do indicador é crucial: sua faixa de viragem deve abranger o pH do ponto de equivalência.</p>

            <div class="reference-block">
                <h4>📖 Referências Bibliográficas</h4>
                <p>• SKOOG, D. A.; WEST, D. M.; HOLLER, F. J. <em>Fundamentos de Química Analítica.</em> 8ª ed. Cengage Learning, 2014.</p>
                <p>• HARVEY, D. <em>Analytical Chemistry 2.0.</em> 1st ed. American Chemical Society, 2016.</p>
                <p>• HAYASHI, A. C. S. <em>Química Analítica Quantitativa.</em> São Paulo: Pearson, 2015.</p>
                <p>• BIRD, R. L. et al. <em>Quantitative Chemical Analysis.</em> 9th ed. Cengage Learning, 2013.</p>
            </div>
        `
    }
};

function initLibrary() {
    showArticle(1);
}

function showArticle(num) {
    // Update article list
    document.querySelectorAll('.article-item').forEach(item => item.classList.remove('active'));
    document.querySelector(`.article-item[data-article="${num}"]`).classList.add('active');

    // Load content
    const article = ARTICLES[num];
    const contentDiv = document.getElementById('articleContent');
    contentDiv.innerHTML = `
        <h1>${article.title}</h1>
        <div class="article-meta">${article.meta}</div>
        ${article.content}
    `;
}

// ===== DASHBOARD =====
function initDashboard() {
    updateSpotlight();
    updateTips();
}

function updateSpotlight() {
    const randomEl = ELEMENTS[Math.floor(Math.random() * 118)];
    const spotlightDiv = document.getElementById('spotlightElement');
    spotlightDiv.innerHTML = `
        <div class="spotlight-symbol">${randomEl.symbol}</div>
        <div class="spotlight-name">${randomEl.name}</div>
        <div class="spotlight-info">
            Z = ${randomEl.z} | Massa = ${typeof randomEl.mass === 'number' ? randomEl.mass.toFixed(2) : randomEl.mass} u | 
            ${CATEGORIES[randomEl.cat]?.label || randomEl.cat}
        </div>
    `;
}

const TIPS = [
    "O hidrogênio é o elemento mais abundante do universo, constituindo cerca de 75% de toda a matéria bariônica.",
    "O mercúrio é o único metal líquido à temperatura ambiente (ponto de fusão: -38,83°C).",
    "O ouro é tão maleável que 1 grama pode ser esticado em um fio de aproximadamente 2 km.",
    "O carbono forma mais compostos químicos do que todos os outros elementos juntos (química orgânica).",
    "O hélio foi descoberto primeiro no Sol (espectroscopia solar, 1868) antes de ser encontrado na Terra.",
    "A água é uma das poucas substâncias que se expande ao congelar, tornando o gelo menos denso que a água líquida.",
    "O nitrogênio líquido é tão frio (-196°C) que pode congelar flores instantaneamente.",
    "O grafite e o diamante são ambos feitos de carbono puro, mas com arranjos cristalinos completamente diferentes.",
    "O oxigênio é o terceiro elemento mais abundante no universo e o mais abundante na crosta terrestre.",
    "O ferro é o elemento mais abundante no núcleo da Terra e o produto final da fusão nuclear em estrelas massivas.",
    "O flúor é o elemento mais eletronegativo e reativo da tabela periódica (EN = 3,98).",
    "O césio tem o menor ponto de fusão entre os metais (28,44°C) — derrete na mão.",
    "O tungstênio possui o maior ponto de fusão de todos os metais (3422°C).",
    "O urânio é denso o suficiente para afundar em mercúrio líquido.",
    "O xenônio pode formar compostos com o flúor, desafiando a ideia de que gases nobres são inertes.",
    "O boro é essencial para a vida vegetal, mas seu papel na bioquímica animal ainda é pouco compreendido.",
    "O selênio é um oligoelemento essencial, mas em altas doses é tóxico.",
    "O titânio é tão forte quanto o aço, mas tem menos da metade do peso e é biocompatível.",
    "O platina é usada em catalisadores automotivos para converter gases poluentes em substâncias menos nocivas.",
    "O iodo foi descoberto por Antoine Becquerel em 1811 em algas marinhas."
];
let currentTip = 0;

function updateTips() {
    const tipDiv = document.getElementById('dailyTip');
    tipDiv.innerHTML = `<p>${TIPS[currentTip]}</p>`;
}

function nextTip() {
    currentTip = (currentTip + 1) % TIPS.length;
    updateTips();
}

// ===== CALCULATION HISTORY =====
const calcHistory = [];

function addToHistory(text) {
    calcHistory.unshift(text);
    if (calcHistory.length > 10) calcHistory.pop();

    const historyDiv = document.getElementById('calcHistory');
    historyDiv.innerHTML = calcHistory.map(h => `<div class="history-item">${h}</div>`).join('');
}

// ===== UTILITY: Canvas roundRect polyfill =====
if (!CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, radii) {
        let r;
        if (typeof radii === 'number') {
            r = [radii, radii, radii, radii];
        } else if (Array.isArray(radii)) {
            r = radii.length === 4 ? radii : [radii[0] || 0, radii[1] || 0, radii[2] || 0, radii[3] || 0];
        } else {
            r = [0, 0, 0, 0];
        }
        this.moveTo(x + r[0], y);
        this.lineTo(x + w - r[1], y);
        this.quadraticCurveTo(x + w, y, x + w, y + r[1]);
        this.lineTo(x + w, y + h - r[2]);
        this.quadraticCurveTo(x + w, y + h, x + w - r[2], y + h);
        this.lineTo(x + r[3], y + h);
        this.quadraticCurveTo(x, y + h, x, y + h - r[3]);
        this.lineTo(x, y + r[0]);
        this.quadraticCurveTo(x, y, x + r[0], y);
        this.closePath();
        return this;
    };
    // ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    initParticles();
    initNavigation();
    initPeriodicTable();
    initCalculators();
    initLibrary();
    initDashboard();
    initTiltEffect();
    initLoadingScreen(); // ← Substitui hideLoadingScreen()
});

// ===== LOADING SCREEN (AGORA INTERATIVO) =====
function initLoadingScreen() {
    const loader = document.getElementById('loadingScreen');
    
    // Adiciona o evento de clique
    loader.addEventListener('click', function onScreenClick() {
        loader.classList.add('hidden');
        // Remove o listener após o primeiro clique para evitar acúmulos
        loader.removeEventListener('click', onScreenClick);
    });
}
}