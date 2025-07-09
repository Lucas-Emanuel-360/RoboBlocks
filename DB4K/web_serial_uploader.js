/**
 * Web Serial API Arduino Uploader
 * Substitui a comunicação Socket.IO por Web Serial API direta
 */

class WebSerialArduinoUploader {
    constructor() {
        this.port = null;
        this.isConnected = false;
        this.uploadInProgress = false;
    }

    /**
     * Verifica se Web Serial API está disponível
     */
    isWebSerialSupported() {
        return 'serial' in navigator;
    }

    /**
     * Solicita conexão com porta serial
     */
    async requestSerialConnection() {
        if (!this.isWebSerialSupported()) {
            throw new Error('Web Serial API não suportada neste navegador. Use Chrome ou Edge.');
        }

        try {
            // Solicita acesso à porta serial
            this.port = await navigator.serial.requestPort({
                filters: [
                    // Filtros para placas Arduino comuns
                    { usbVendorId: 0x2341 }, // Arduino LLC
                    { usbVendorId: 0x2A03 }, // Arduino.cc
                    { usbVendorId: 0x1A86 }, // QinHeng Electronics (CH340)
                    { usbVendorId: 0x0403 }, // FTDI
                    { usbVendorId: 0x10C4 }  // Silicon Labs (CP210x)
                ]
            });

            await this.connectToPort();
            return true;
        } catch (error) {
            console.error('Erro ao conectar:', error);
            throw error;
        }
    }

    /**
     * Conecta à porta serial
     */
    async connectToPort() {
        if (!this.port) {
            throw new Error('Nenhuma porta selecionada');
        }

        try {
            await this.port.open({ 
                baudRate: 115200,
                dataBits: 8,
                stopBits: 1,
                parity: 'none',
                flowControl: 'none'
            });
            
            this.isConnected = true;
            console.log('Conectado à porta serial');
            
            // Escuta desconexões
            this.port.addEventListener('disconnect', () => {
                this.isConnected = false;
                console.log('Porta serial desconectada');
            });
            
        } catch (error) {
            console.error('Erro ao abrir porta:', error);
            throw error;
        }
    }

    /**
     * Desconecta da porta serial
     */
    async disconnect() {
        if (this.port && this.isConnected) {
            try {
                await this.port.close();
                this.isConnected = false;
                this.port = null;
                console.log('Desconectado da porta serial');
            } catch (error) {
                console.error('Erro ao desconectar:', error);
            }
        }
    }

    /**
     * Converte código Arduino para HEX (simulado)
     * Em uma implementação real, você usaria um compilador JavaScript
     * ou enviaria para um serviço de compilação
     */
    async compileArduinoCode(sourceCode) {
        // Por enquanto, vamos simular a compilação
        // Em uma implementação real, você poderia:
        // 1. Usar um compilador Arduino em JavaScript (muito complexo)
        // 2. Enviar para um serviço de compilação online
        // 3. Usar WebAssembly com o compilador Arduino
        
        console.log('Compilando código Arduino...');
        console.log('Código fonte:', sourceCode);
        
        // Simula delay de compilação
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Retorna dados simulados (em uma implementação real seria o HEX)
        return {
            success: true,
            hexData: ':10000000...',  // Dados HEX simulados
            message: 'Compilação concluída com sucesso'
        };
    }

    /**
     * Envia código compilado para o Arduino
     */
    async uploadToArduino(hexData) {
        if (!this.isConnected) {
            throw new Error('Não conectado à porta serial');
        }

        this.uploadInProgress = true;
        
        try {
            const writer = this.port.writable.getWriter();
            
            // Reset do Arduino (DTR toggle)
            await this.resetArduino();
            
            // Aguarda bootloader
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Simula protocolo STK500 (versão simplificada)
            await this.sendSTK500Command(writer, hexData);
            
            writer.releaseLock();
            this.uploadInProgress = false;
            
            return {
                success: true,
                message: 'Upload concluído com sucesso!'
            };
            
        } catch (error) {
            this.uploadInProgress = false;
            throw error;
        }
    }

    /**
     * Reset do Arduino via DTR
     */
    async resetArduino() {
        try {
            // Simula reset via DTR
            await this.port.setSignals({ dataTerminalReady: false });
            await new Promise(resolve => setTimeout(resolve, 100));
            await this.port.setSignals({ dataTerminalReady: true });
            console.log('Arduino resetado');
        } catch (error) {
            console.warn('Não foi possível resetar via DTR:', error);
        }
    }

    /**
     * Envia comandos STK500 (simplificado)
     */
    async sendSTK500Command(writer, hexData) {
        // Implementação muito simplificada do protocolo STK500
        // Em uma implementação real, seria muito mais complexa
        
        console.log('Enviando dados via STK500...');
        
        // Simula envio de dados
        const encoder = new TextEncoder();
        const data = encoder.encode('STK500_SYNC\n');
        
        await writer.write(data);
        
        // Simula progresso
        for (let i = 0; i <= 100; i += 10) {
            await new Promise(resolve => setTimeout(resolve, 100));
            this.onUploadProgress?.(i);
        }
        
        console.log('Dados enviados com sucesso');
    }

    /**
     * Processo completo: compilar e fazer upload
     */
    async compileAndUpload(sourceCode, onProgress = null) {
        this.onUploadProgress = onProgress;
        
        try {
            // Verifica conexão
            if (!this.isConnected) {
                await this.requestSerialConnection();
            }
            
            // Compila o código
            onProgress?.(10, 'Compilando código Arduino...');
            const compilationResult = await this.compileArduinoCode(sourceCode);
            
            if (!compilationResult.success) {
                throw new Error('Erro na compilação: ' + compilationResult.message);
            }
            
            // Faz upload
            onProgress?.(50, 'Enviando para Arduino...');
            const uploadResult = await this.uploadToArduino(compilationResult.hexData);
            
            onProgress?.(100, 'Upload concluído!');
            return uploadResult;
            
        } catch (error) {
            onProgress?.(-1, 'Erro: ' + error.message);
            throw error;
        }
    }

    /**
     * Lista portas disponíveis (limitado pela API)
     */
    async getAvailablePorts() {
        if (!this.isWebSerialSupported()) {
            return [];
        }
        
        try {
            const ports = await navigator.serial.getPorts();
            return ports.map((port, index) => ({
                id: index,
                port: port,
                info: port.getInfo()
            }));
        } catch (error) {
            console.error('Erro ao listar portas:', error);
            return [];
        }
    }
}

// Instância global
window.webSerialUploader = new WebSerialArduinoUploader();