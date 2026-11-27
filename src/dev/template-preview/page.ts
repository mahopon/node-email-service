/**
 * Single-page UI for the template preview helper.
 *
 * Kept as a string so the compiled server needs no static-asset pipeline:
 * the page is dev-only and served from /dev/templates.
 */
export const templatePreviewPage = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Email template preview</title>
<style>
    :root {
        --bg: #f4f4f5;
        --panel: #ffffff;
        --border: #d4d4d8;
        --text: #18181b;
        --muted: #71717a;
        --accent: #18181b;
        --danger: #b91c1c;
        --ok: #15803d;
    }
    * { box-sizing: border-box; }
    html, body { height: 100%; }
    body {
        margin: 0;
        background: var(--bg);
        color: var(--text);
        font: 14px/1.45 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        padding: 10px 16px;
        background: var(--panel);
        border-bottom: 1px solid var(--border);
    }
    header h1 { margin: 0; font-size: 15px; font-weight: 600; }
    header .meta { display: flex; align-items: center; gap: 12px; color: var(--muted); font-size: 12px; }
    header a { color: var(--muted); }
    #status { color: var(--ok); font-size: 12px; min-height: 1em; }
    #status.error { color: var(--danger); }
    main {
        display: grid;
        grid-template-columns: minmax(360px, 42%) 1fr;
        gap: 12px;
        padding: 12px;
        height: calc(100vh - 45px);
    }
    .panel {
        display: flex;
        flex-direction: column;
        min-height: 0;
        background: var(--panel);
        border: 1px solid var(--border);
        border-radius: 8px;
        overflow: hidden;
    }
    .panel-head {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 10px;
        border-bottom: 1px solid var(--border);
        background: #fafafa;
    }
    .panel-head label { font-size: 12px; color: var(--muted); }
    .panel-head select {
        flex: 1;
        min-width: 0;
        padding: 4px 6px;
        font: inherit;
    }
    .panel-body { display: flex; flex-direction: column; min-height: 0; flex: 1; }
    .field { display: flex; flex-direction: column; min-height: 0; flex: 1; padding: 10px; gap: 6px; }
    .field + .field { border-top: 1px solid var(--border); }
    .field > .label-row { display: flex; align-items: center; justify-content: space-between; }
    .field label { font-size: 12px; font-weight: 600; color: var(--muted); }
    textarea {
        flex: 1;
        min-height: 120px;
        width: 100%;
        resize: none;
        padding: 8px;
        border: 1px solid var(--border);
        border-radius: 6px;
        font: 12px/1.5 ui-monospace, SFMono-Regular, Menlo, monospace;
        tab-size: 4;
    }
    textarea:focus, select:focus, input:focus { outline: 2px solid #a1a1aa; outline-offset: -1px; }
    button {
        padding: 5px 10px;
        border: 1px solid var(--border);
        border-radius: 6px;
        background: #fff;
        color: var(--text);
        font: inherit;
        font-size: 12px;
        cursor: pointer;
    }
    button:hover { background: #f4f4f5; }
    button.primary { background: var(--accent); border-color: var(--accent); color: #fff; }
    button.primary:hover { background: #27272a; }
    .actions { display: flex; gap: 6px; margin-left: auto; }
    .preview-toolbar {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 8px;
        padding: 8px 10px;
        border-bottom: 1px solid var(--border);
        background: #fafafa;
    }
    .tabs { display: flex; gap: 4px; }
    .tabs button.active { background: var(--accent); border-color: var(--accent); color: #fff; }
    .send { display: flex; gap: 6px; margin-left: auto; flex-wrap: wrap; }
    .send input {
        padding: 5px 8px;
        border: 1px solid var(--border);
        border-radius: 6px;
        font: inherit;
        font-size: 12px;
        min-width: 0;
    }
    #to { width: 190px; }
    #subject { width: 150px; }
    #error {
        margin: 0;
        padding: 8px 10px;
        border-bottom: 1px solid var(--border);
        background: #fef2f2;
        color: var(--danger);
        font-size: 12px;
        white-space: pre-wrap;
        max-height: 30%;
        overflow: auto;
    }
    #preview { flex: 1; width: 100%; border: 0; background: #fff; }
    #text {
        flex: 1;
        margin: 0;
        padding: 16px;
        overflow: auto;
        white-space: pre-wrap;
        font: 13px/1.6 ui-monospace, SFMono-Regular, Menlo, monospace;
        background: #fff;
    }
    @media (max-width: 860px) {
        main { grid-template-columns: 1fr; height: auto; }
        .panel.preview-panel { height: 70vh; }
    }
</style>
</head>
<body>
<header>
    <h1>Email template preview</h1>
    <div class="meta">
        <span id="status"></span>
        <a id="mailpit" href="http://localhost:8025" target="_blank" rel="noreferrer">Open Mailpit</a>
    </div>
</header>
<main>
    <section class="panel">
        <div class="panel-head">
            <label for="template">Template</label>
            <select id="template"></select>
            <div class="actions">
                <button id="save">Save template</button>
                <button id="save-data">Save sample data</button>
            </div>
        </div>
        <div class="panel-body">
            <div class="field">
                <div class="label-row">
                    <label for="source">Source (.njk)</label>
                    <span style="font-size: 11px; color: var(--muted);">Cmd/Ctrl+S to save</span>
                </div>
                <textarea id="source" spellcheck="false"></textarea>
            </div>
            <div class="field" style="flex: 0 0 32%;">
                <div class="label-row">
                    <label for="data">Sample data (JSON)</label>
                </div>
                <textarea id="data" spellcheck="false"></textarea>
            </div>
        </div>
    </section>

    <section class="panel preview-panel">
        <div class="preview-toolbar">
            <div class="tabs">
                <button data-view="html" class="active">HTML</button>
                <button data-view="text">Plain text</button>
            </div>
            <div class="send">
                <input id="to" value="dev@example.com" placeholder="Recipient" />
                <input id="subject" placeholder="Subject" />
                <button id="send" class="primary">Send test</button>
            </div>
        </div>
        <pre id="error" hidden></pre>
        <iframe id="preview" sandbox="allow-popups allow-popups-to-escape-sandbox" title="Rendered email"></iframe>
        <pre id="text" hidden></pre>
    </section>
</main>

<script>
(function () {
    var els = {
        template: document.getElementById('template'),
        source: document.getElementById('source'),
        data: document.getElementById('data'),
        save: document.getElementById('save'),
        saveData: document.getElementById('save-data'),
        send: document.getElementById('send'),
        to: document.getElementById('to'),
        subject: document.getElementById('subject'),
        preview: document.getElementById('preview'),
        text: document.getElementById('text'),
        error: document.getElementById('error'),
        status: document.getElementById('status'),
        mailpit: document.getElementById('mailpit')
    };

    var current = null;
    var renderTimer = null;
    var statusTimer = null;
    var view = 'html';
    // Works whether the page is loaded as /dev/templates or /dev/templates/.
    var base = location.pathname.charAt(location.pathname.length - 1) === '/'
        ? location.pathname
        : location.pathname + '/';

    els.mailpit.href = location.protocol + '//' + location.hostname + ':8025';

    function setStatus(message, isError) {
        els.status.textContent = message || '';
        els.status.className = isError ? 'error' : '';
        clearTimeout(statusTimer);
        if (message) {
            statusTimer = setTimeout(function () { els.status.textContent = ''; }, 4000);
        }
    }

    function showError(message) {
        if (!message) {
            els.error.hidden = true;
            els.error.textContent = '';
            return;
        }
        els.error.hidden = false;
        els.error.textContent = message;
    }

    function api(path, options) {
        return fetch(base + path, options).then(function (res) {
            if (!res.ok) {
                return res.json().catch(function () { return null; }).then(function (body) {
                    var message = (body && body.error) || (res.status + ' ' + res.statusText);
                    var error = new Error(message);
                    error.status = res.status;
                    throw error;
                });
            }
            return res.json();
        });
    }

    function jsonRequest(method, payload) {
        return {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        };
    }

    function readData() {
        var raw = els.data.value.trim();
        if (!raw) return {};
        var parsed = JSON.parse(raw);
        if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
            throw new Error('Sample data must be a JSON object');
        }
        return parsed;
    }

    function render() {
        var data;
        try {
            data = readData();
        } catch (err) {
            showError('Sample data: ' + err.message);
            return;
        }

        api('api/render', jsonRequest('POST', {
            name: current,
            source: els.source.value,
            data: data
        })).then(function (result) {
            els.preview.srcdoc = result.html;
            els.text.textContent = result.text;
            showError('');
        }).catch(function (err) {
            showError(err.message);
        });
    }

    function scheduleRender() {
        clearTimeout(renderTimer);
        renderTimer = setTimeout(render, 300);
    }

    function loadTemplate(name) {
        return api('api/templates/' + encodeURIComponent(name)).then(function (result) {
            current = result.name;
            els.source.value = result.source;
            els.data.value = JSON.stringify(result.sample || {}, null, 2) + '\\n';
            els.subject.value = result.name;
            showError('');
            return render();
        }).catch(function (err) {
            showError(err.message);
        });
    }

    function loadList() {
        return api('api/templates').then(function (result) {
            els.template.innerHTML = '';
            result.templates.forEach(function (name) {
                var option = document.createElement('option');
                option.value = name;
                option.textContent = name;
                els.template.appendChild(option);
            });

            if (!result.templates.length) {
                showError('No templates found. Add a .njk file under templates/.');
                return;
            }

            els.template.value = result.templates[0];
            return loadTemplate(result.templates[0]);
        }).catch(function (err) {
            showError(err.message);
        });
    }

    function saveTemplate() {
        var proposed = window.prompt('Save template as (file name):', current || '');
        if (proposed === null) {
            return;
        }

        var name = proposed.trim();
        if (name.slice(-4) === '.njk') {
            name = name.slice(0, -4);
        }
        if (!name) {
            showError('File name is required');
            return;
        }
        if (!/^[a-zA-Z0-9_-]+$/.test(name)) {
            showError('Invalid file name: use letters, numbers, "-" or "_"');
            return;
        }

        putTemplate(name, false).then(function () {
            applySaved(name);
        }).catch(function (err) {
            if (err.status === 409) {
                if (!window.confirm('templates/' + name + '.njk already exists. Overwrite it?')) {
                    return;
                }
                putTemplate(name, true).then(function () {
                    applySaved(name);
                }).catch(function (overwriteErr) {
                    showError(overwriteErr.message);
                });
                return;
            }
            showError(err.message);
        });
    }

    function putTemplate(name, overwrite) {
        return api('api/templates/' + encodeURIComponent(name), jsonRequest('PUT', {
            source: els.source.value,
            overwrite: overwrite
        }));
    }

    function applySaved(name) {
        current = name;
        ensureOption(name);
        els.template.value = name;
        setStatus('Saved templates/' + name + '.njk');
        showError('');
        render();
    }

    function ensureOption(name) {
        for (var i = 0; i < els.template.options.length; i++) {
            if (els.template.options[i].value === name) {
                return;
            }
        }

        var option = document.createElement('option');
        option.value = name;
        option.textContent = name;
        els.template.appendChild(option);
    }

    function saveSampleData() {
        if (!current) return;
        var data;
        try {
            data = readData();
        } catch (err) {
            showError('Sample data: ' + err.message);
            return;
        }

        api('api/templates/' + encodeURIComponent(current) + '/sample', jsonRequest('PUT', {
            data: data
        })).then(function () {
            setStatus('Sample data saved');
            showError('');
        }).catch(function (err) {
            showError(err.message);
        });
    }

    function sendTest() {
        var data;
        try {
            data = readData();
        } catch (err) {
            showError('Sample data: ' + err.message);
            return;
        }

        if (!els.to.value.trim()) {
            showError('Recipient is required');
            return;
        }

        setStatus('Sending...');
        api('api/send', jsonRequest('POST', {
            to: els.to.value.trim(),
            subject: els.subject.value,
            name: current,
            source: els.source.value,
            data: data
        })).then(function () {
            setStatus('Sent — check Mailpit');
            showError('');
        }).catch(function (err) {
            setStatus('Send failed', true);
            showError(err.message);
        });
    }

    function setView(next) {
        view = next;
        var buttons = document.querySelectorAll('[data-view]');
        for (var i = 0; i < buttons.length; i++) {
            buttons[i].classList.toggle('active', buttons[i].getAttribute('data-view') === view);
        }
        els.preview.hidden = view !== 'html';
        els.text.hidden = view !== 'text';
    }

    els.template.addEventListener('change', function () {
        loadTemplate(els.template.value);
    });
    els.source.addEventListener('input', scheduleRender);
    els.data.addEventListener('input', scheduleRender);
    els.save.addEventListener('click', saveTemplate);
    els.saveData.addEventListener('click', saveSampleData);
    els.send.addEventListener('click', sendTest);
    document.querySelectorAll('[data-view]').forEach(function (button) {
        button.addEventListener('click', function () {
            setView(button.getAttribute('data-view'));
        });
    });
    document.addEventListener('keydown', function (event) {
        if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 's') {
            event.preventDefault();
            saveTemplate();
        }
    });

    loadList();
})();
</script>
</body>
</html>
`;
