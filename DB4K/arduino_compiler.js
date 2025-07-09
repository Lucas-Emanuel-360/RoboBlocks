/**
 * Integração Web Serial API com DB4K
 * Substitui as funções Socket.IO existentes
 */

// Aguarda o DOM estar carregado
document.addEventListener('DOMContentLoaded', function() {
    initWebSerialIntegration();
});

function initWebSerialIntegration() {
    console.log('Inicializando integração Web Serial API...');
    
    // Verifica suporte
    if (!window.webSerialUploader.isWebSerialSupported()) {
        showCompatibilityWarning();
        return;
    }
    
    // Substitui as funções existentes
    replaceSocketIOFunctions();
    
    // Adiciona event listeners
    setupEventListeners();
    
    console.log('Web Serial API configurada com sucesso!');
}

/**
 * Mostra aviso de compatibilidade
 */
function showCompatibilityWarning() {
    const message = `
        <h5>Navegador não compatível</h5>
        <p>A funcionalidade de upload direto para Arduino requer um navegador compatível com Web Serial API.</p>
        <p><strong>Navegadores suportados:</strong></p>
        <ul>
            <li>Google Chrome 89+</li>
            <li>Microsoft Edge 89+</li>
            <li>Opera 75+</li>
        </ul>
        <p>Por favor, use um destes navegadores para fazer upload dos programas.</p>
    `;
    
    // Usa o sistema de modal existente do DB4K
    showAlert('Navegador Incompatível', message);
}

/**
 * Substitui as funções Socket.IO pelas Web Serial
 */
function replaceSocketIOFunctions() {
    // Intercepta o clique do botão de upload principal
    const uploadButton = document.getElementById('button_ide_large');
    if (uploadButton) {
        // Remove listeners antigos
        uploadButton.replaceWith(uploadButton.cloneNode(true));
        const newUploadButton = document.getElementById('button_ide_large');
        
        newUploadButton.addEventListener('click', handleWebSerialUpload);
        console.log('Botão de upload redirecionado para Web Serial API');
    }
    
    // Substitui função de configurações se existir
    if (window.Ardublockly && window.Ardublockly.openSettings) {
        const originalOpenSettings = window.Ardublockly.openSettings;
        window.Ardublockly.openSettings = function() {
            openWebSerialSettings();
        };
    }
}

/**
 * Configura event listeners
 */
function setupEventListeners() {
    // Botão de parar (se existir)
    const stopButton = document.getElementById('button_stop');
    if (stopButton) {
        stopButton.addEventListener('click', handleStopUpload);
    }
    
    // Monitora mudanças na conexão serial
    if ('serial' in navigator) {
        navigator.serial.addEventListener('connect', (event) => {
            console.log('Dispositivo serial conectado:', event.port.getInfo());
            updateConnectionStatus(true);
        });
        
        navigator.serial.addEventListener('disconnect', (event) => {
            console.log('Dispositivo serial desconectado');
            updateConnectionStatus(false);
        });
    }
}

/**
 * Manipula o upload via Web Serial
 */
async function handleWebSerialUpload() {
    try {
        // Mostra spinner de loading
        showUploadSpinner(true);
        
        // Obtém código Arduino gerado
        const arduinoCode = getArduinoCode();
        
        if (!arduinoCode || arduinoCode.trim() === '') {
            throw new Error('Nenhum código Arduino para enviar. Adicione blocos primeiro.');
        }
        
        console.log('Iniciando upload via Web Serial...');
        
        // Chama função de upload
        const result = await window.webSerialUploader.compileAndUpload(
            arduinoCode,
            updateUploadProgress
        );
        
        // Sucesso
        showUploadSuccess(result.message);
        
    } catch (error) {
        console.error('Erro no upload:', error);
        showUploadError(error.message);
    } finally {
        showUploadSpinner(false);
    }
}

/**
 * Para o upload em andamento
 */
async function handleStopUpload() {
    try {
        await window.webSerialUploader.disconnect();
        showUploadSpinner(false);
        updateIdeOutput('Upload cancelado pelo usuário.');
    } catch (error) {
        console.error('Erro ao parar upload:', error);
    }
}

/**
 * Obtém o código Arduino atual
 */
function getArduinoCode() {
    const codeElement = document.getElementById('content_arduino');
    return codeElement ? codeElement.textContent || codeElement.innerText : '';
}

/**
 * Atualiza progresso do upload
 */
function updateUploadProgress(percentage, message) {
    console.log(`Upload: ${percentage}% - ${message}`);
    
    // Atualiza output do IDE
    updateIdeOutput(`${message} (${percentage}%)`);
    
    // Se houver barra de progresso, atualiza aqui
    const progressBar = document.querySelector('.upload-progress');
    if (progressBar) {
        progressBar.style.width = `${percentage}%`;
    }
}

/**
 * Mostra/esconde spinner de upload
 */
function showUploadSpinner(show) {
    const button = document.getElementById('button_ide_large');
    const spinner = document.getElementById('button_ide_large_spinner');
    
    if (button && spinner) {
        if (show) {
            button.style.display = 'none';
            spinner.style.display = 'block';
        } else {
            button.style.display = 'block';
            spinner.style.display = 'none';
        }
    }
}

/**
 * Mostra mensagem de sucesso
 */
function showUploadSuccess(message) {
    updateIdeOutput(`✅ ${message}`, 'success');
    
    // Mostra notificação se disponível
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('DB4K - Upload Concluído', {
            body: message,
            icon: 'img/db4kimages/icon_db4k.ico'
        });
    }
}

/**
 * Mostra mensagem de erro
 */
function showUploadError(message) {
    updateIdeOutput(`❌ Erro: ${message}`, 'error');
    
    // Mostra alert
    showAlert('Erro no Upload', message);
}

/**
 * Atualiza output do IDE
 */
function updateIdeOutput(message, type = 'info') {
    const outputElement = document.getElementById('content_ide_output');
    if (outputElement) {
        const timestamp = new Date().toLocaleTimeString();
        const colorClass = type === 'error' ? 'red-text' : 
                          type === 'success' ? 'green-text' : '';
        
        const newMessage = `<div class="${colorClass}">[${timestamp}] ${message}</div>`;
        outputElement.innerHTML += newMessage;
        
        // Scroll para baixo
        outputElement.scrollTop = outputElement.scrollHeight;
    }
}

/**
 * Atualiza status da conexão
 */
function updateConnectionStatus(connected) {
    // Atualiza interface para mostrar status da conexão
    const statusIndicator = document.querySelector('.connection-status');
    if (statusIndicator) {
        statusIndicator.classList.toggle('connected', connected);
        statusIndicator.textContent = connected ? 'Conectado' : 'Desconectado';
    }
}

/**
 * Abre configurações Web Serial
 */
function openWebSerialSettings() {
    const settingsContent = `
        <div class="modal-content">
            <h4>Configurações Web Serial</h4>
            <div class="modal_section">
                <p><strong>Status:</strong> <span id="webserial-status">Verificando...</span></p>
            </div>
            <div class="modal_section">
                <label>Porta Serial:</label>
                <button id="connect-serial-btn" class="btn waves-effect">
                    Conectar Arduino
                </button>
            </div>
            <div class="modal_section">
                <p class="grey-text">
                    <i class="material-icons tiny">info</i>
                    Use Chrome ou Edge para melhor compatibilidade
                </p>
            </div>
        </div>
    `;
    
    // Mostra modal customizado ou usa o existente
    showCustomModal('Configurações', settingsContent, () => {
        setupSerialSettingsModal();
    });
}

/**
 * Configura modal de configurações
 */
function setupSerialSettingsModal() {
    const statusElement = document.getElementById('webserial-status');
    const connectButton = document.getElementById('connect-serial-btn');
    
    // Atualiza status
    if (window.webSerialUploader.isWebSerialSupported()) {
        statusElement.textContent = 'Web Serial API Suportada ✅';
        statusElement.className = 'green-text';
    } else {
        statusElement.textContent = 'Web Serial API Não Suportada ❌';
        statusElement.className = 'red-text';
        connectButton.disabled = true;
    }
    
    // Configura botão de conexão
    if (connectButton) {
        connectButton.addEventListener('click', async () => {
            try {
                connectButton.textContent = 'Conectando...';
                connectButton.disabled = true;
                
                await window.webSerialUploader.requestSerialConnection();
                
                connectButton.textContent = 'Conectado ✅';
                connectButton.className = 'btn waves-effect green';
                
            } catch (error) {
                connectButton.textContent = 'Erro na Conexão';
                connectButton.className = 'btn waves-effect red';
                connectButton.disabled = false;
                
                setTimeout(() => {
                    connectButton.textContent = 'Tentar Novamente';
                    connectButton.className = 'btn waves-effect';
                }, 3000);
            }
        });
    }
}

/**
 * Mostra alert personalizado (usa sistema existente do DB4K)
 */
function showAlert(title, message) {
    // Tenta usar o modal existente do DB4K
    const alertModal = document.getElementById('gen_alert');
    const titleElement = document.getElementById('gen_alert_title');
    const bodyElement = document.getElementById('gen_alert_body');
    
    if (alertModal && titleElement && bodyElement) {
        titleElement.textContent = title;
        bodyElement.innerHTML = message;
        
        // Abre modal usando Materialize
        if (window.$ && window.$.fn.modal) {
            $(alertModal).modal('open');
        }
    } else {
        // Fallback para alert nativo
        alert(`${title}\n\n${message.replace(/<[^>]*>/g, '')}`);
    }
}

/**
 * Mostra modal customizado
 */
function showCustomModal(title, content, callback) {
    // Implementação simplificada
    // Em uma versão completa, criaria um modal dinâmico
    showAlert(title, content);
    if (callback) callback();
}

// Solicita permissão para notificações
if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
}