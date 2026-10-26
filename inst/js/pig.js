
// draws the parts of the pig which depend on the size the svg is shown at:
// a speech bubble saying what that size is, and grass along the ground --
// a tuft for every 40px of width. these are redrawn whenever the svg is
// resized, jamovi's resize grip included. the pig's body is interactive
// (see pig.b.R), and a click on it has the pig object, and blush, for a few
// seconds. the size in the bubble is interactive too: a click on it lets a
// size be typed in, which jamovi applies and stores as if it were dragged to

window.pig = {

    attach(id) {

        const svg = document.getElementById(id);
        if ( ! svg)
            return;

        const observer = new ResizeObserver((entries) => {
            // a rerun of the analysis replaces the svg
            if ( ! svg.isConnected) {
                observer.disconnect();
                return;
            }
            const { width, height } = entries[entries.length - 1].contentRect;
            pig._draw(svg, width, height);
        });

        observer.observe(svg);

        const body = svg.querySelector('.pig-body');
        if (body) {
            body.addEventListener('click', () => {
                clearTimeout(svg._pigProtest);
                svg._pigProtesting = true;
                pig._blush(svg, true);
                pig._redraw(svg);
                svg._pigProtest = setTimeout(() => {
                    svg._pigProtesting = false;
                    pig._blush(svg, false);
                    pig._redraw(svg);
                }, 5000);
            });
        }

        // the bubble is redrawn with every resize, so listen on the svg
        svg.addEventListener('click', (event) => {
            if (event.target.closest('.pig-size'))
                pig._editSize(svg);
        });
    },

    // swaps the size in the bubble for a field to type a new one into.
    // enter (or clicking away) applies it, escape abandons it
    _editSize(svg) {

        const sized = svg.querySelector('.pig-sized');
        const text = svg.querySelector('.pig-size');
        if ( ! sized || ! text || svg.querySelector('.pig-size-editor'))
            return;

        const editor = document.createElementNS('http://www.w3.org/2000/svg', 'foreignObject');
        editor.setAttribute('class', 'pig-size-editor jmv-results-svg-interactive');
        editor.setAttribute('x', '40');
        editor.setAttribute('y', '48');
        editor.setAttribute('width', '110');
        editor.setAttribute('height', '17');

        const input = document.createElement('input');
        input.value = text.textContent;
        input.setAttribute('aria-label', 'Size, as width × height');
        input.style.cssText = `
            box-sizing: border-box; width: 100%; height: 100%; padding: 0;
            border: none; outline: 1px solid #b3476b; border-radius: 2px;
            font: bold 13px sans-serif; color: #b3476b; text-align: center;
            background: #fff;`;
        editor.append(input);

        text.style.visibility = 'hidden';
        sized.append(editor);
        input.focus();
        input.select();

        let done = false;
        const finish = (apply) => {
            if (done)
                return;
            done = true;
            editor.remove();
            text.style.visibility = '';
            // 640 × 480, 640x480, 640 480 ...
            const match = input.value.match(/(\d+)\D+(\d+)/);
            if (apply && match) {
                svg.dispatchEvent(new CustomEvent('jmv-results-svg-resize', {
                    bubbles: true,
                    detail: { width: Number(match[1]), height: Number(match[2]) },
                }));
            }
        };

        input.addEventListener('keydown', (event) => {
            // the keys are the field's, not the results'
            event.stopPropagation();
            if (event.key === 'Enter')
                finish(true);
            else if (event.key === 'Escape')
                finish(false);
        });
        input.addEventListener('blur', () => finish(true));
    },

    // each shape which blushes carries the colour it blushes to. clearing
    // the style returns it to its fill attribute, and the shape's transition
    // fades it both ways
    _blush(svg, blushing) {
        for (const shape of svg.querySelectorAll('[data-blush]'))
            shape.style.fill = blushing ? shape.dataset.blush : '';
    },

    _redraw(svg) {
        if (svg.isConnected && svg._pigSize)
            pig._draw(svg, svg._pigSize.width, svg._pigSize.height);
    },

    _draw(svg, width, height) {

        const sized = svg.querySelector('.pig-sized');
        if ( ! sized)
            return;

        svg._pigSize = { width, height };

        const w = Math.round(width);
        const h = Math.round(height);
        const tufts = Math.max(1, Math.round(width / 40));

        let grass = '';
        for (let i = 0; i < tufts; i++) {
            // spread along the ground, which runs from x=60 to x=360
            const x = 60 + (i + 0.5) * (300 / tufts);
            grass += `<path d="M ${ x - 5 } 258 l 2 -9 l 3 7 l 3 -11 l 2 13"
                            fill="none" stroke="#6aa84f" stroke-width="2"
                            stroke-linejoin="round" stroke-linecap="round" />`;
        }

        sized.innerHTML = `
            ${ grass }
            <g font-family="sans-serif" text-anchor="middle">
                <path d="M 30 24 h 130 a 10 10 0 0 1 10 10 v 26 a 10 10 0 0 1 -10 10
                         h -20 l 16 20 l -32 -20 h -94 a 10 10 0 0 1 -10 -10 v -26
                         a 10 10 0 0 1 10 -10 z"
                      fill="#fff" stroke="#b3476b" stroke-width="2" />
                ${ svg._pigProtesting ? `
                <text x="95" y="43" font-size="13" fill="#b3476b">Don't touch</text>
                <text x="95" y="60" font-size="13" fill="#b3476b"
                      font-weight="bold">my bacon!</text>` : `
                <text x="95" y="43" font-size="13" fill="#b3476b">Oink! I'm</text>
                <text class="pig-size jmv-results-svg-interactive"
                      x="95" y="60" font-size="13" fill="#b3476b"
                      font-weight="bold" style="cursor: text"
                      >${ w } × ${ h }</text>` }
            </g>`;
    },
};
