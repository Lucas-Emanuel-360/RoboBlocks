/**
 * @license
 * Visual Blocks Language
 *
 * Copyright 2012 Google Inc.
 * https://developers.google.com/blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Generating Code for DBK special Blocks.
 * @author Rubens Queiroz
 */
'use strict';

goog.provide('Blockly.Arduino.controles');
goog.require('Blockly.Arduino');

var DB4K_tipo_biblioteca_ultrassonico=1;
//'1' para biblio antiga (ultrasonic.Ranging(CM))e 
//'2' para a biblio nova (ultrasonic.read())
var DB4K_pino_ultrasonic_echo=7;
var DB4K_pino_ultrasonic_envio_sinal=6;
var DB4K_ultrasonic_delay_leitura=100;

//SENSOR_TEMPERATURA
var DB4K_pino_analogico_sensor_temperatura='A0';
var DB4K_valor_margem_temperatura_alta = 3;
var DB4K_valor_margem_temperatura_baixa = 3;


//SENSOR_LUZ
var DB4K_pino_analogico_LDR_luz='A1';
var DB4K_valor_margem_luz_alta = 70;
var DB4K_valor_margem_luz_baixa = 90;

//SENSOR_REFLETANCIA
var DB4K_pino_analogico_sensor_linha_direito='A2';
var DB4K_pino_analogico_sensor_linha_esquerdo='A3';
var DB4K_pino_analogico_sensor_linha_centro='A4';
var DB4K_valor_margem_refletancia_baixa = 100;
var DB4K_valor_margem_refletancia_alta = 100;
var DB4K_valor_margem_refletancia_media_inicio = 100;
var DB4K_valor_margem_refletancia_media_fim = 600;


//POTENCIOMETRO
var DB4K_pino_analogico_potenciometro = 'A5';
var DB4K_med_val_potenciometro_sup = 700;
var DB4K_med_val_potenciometro_inf = 300;

//SENSOR DE TOQUE
var DB4K_pino_sensor_toque = 15;
var DB4K_pino_sensor_toque1 = 16;
var DB4K_pino_sensor_toque2 = 14;
var DB4K_pino_sensor_toque3 = 17;
//--------------------------------------------
//Generators included by RLQ - DB4K
//--------------------------------------------

Blockly.Arduino['monitor_serial'] = function(block) {
  var sensor = block.getFieldValue('sensor');
  var codigo_sensor = '';

  // 1. GARANTE QUE O SERIAL.BEGIN ESTEJA NO SETUP
  // Isso corrige o problema de chamar Serial.begin() repetidamente no loop.
  Blockly.Arduino.addSetup('serial_begin', 'Serial.begin(9600);', false);

  // 2. CORRIGE A LÓGICA DE CADA SENSOR
  switch(sensor) {
    case 'sensor_luz':
      // Define o pino dentro do case para manter o código organizado
      Blockly.Arduino.definitions_['pino_ldr'] = 'int DB4K_pino_analogico_LDR_luz = A0;'; // Exemplo de pino
      codigo_sensor = 'int valor = analogRead(DB4K_pino_analogico_LDR_luz);\n' +
                      'Serial.print("Luz: ");\n' +
                      'Serial.println(valor);\n';
      break;

    case 'sensor_temperatura':
      Blockly.Arduino.definitions_['pino_temp'] = 'int DB4K_pino_analogico_sensor_temperatura = A1;'; // Exemplo de pino
      codigo_sensor = 'int valor = analogRead(DB4K_pino_analogico_sensor_temperatura);\n' +
                      'Serial.print("Temperatura: ");\n' +
                      'Serial.println(valor);\n';
      break;

    case 'sensor_distancia':
      // LÓGICA CORRETA PARA SENSOR ULTRASSÔNICO
      Blockly.Arduino.definitions_['pino_ultrasonic_trig'] = 'int DB4K_pino_ultrasonic_trig = 12;'; // Exemplo de pino
      Blockly.Arduino.definitions_['pino_ultrasonic_echo'] = 'int DB4K_pino_ultrasonic_echo = 13;'; // Exemplo de pino
      
      var func = [
        'long ler_distancia_cm(int pino_trig, int pino_echo) {',
        '  pinMode(pino_trig, OUTPUT);',
        '  pinMode(pino_echo, INPUT);',
        '  digitalWrite(pino_trig, LOW);',
        '  delayMicroseconds(2);',
        '  digitalWrite(pino_trig, HIGH);',
        '  delayMicroseconds(10);',
        '  digitalWrite(pino_trig, LOW);',
        '  long duration = pulseIn(pino_echo, HIGH);',
        '  return duration * 0.034 / 2;',
        '}'
      ];
      var funcName = Blockly.Arduino.addFunction('ler_distancia_ultrassonica', func.join('\n'));

      codigo_sensor = 'long distancia = ' + funcName + '(DB4K_pino_ultrasonic_trig, DB4K_pino_ultrasonic_echo);\n' +
                      'Serial.print("Distancia (cm): ");\n' +
                      'Serial.println(distancia);\n';
      break;

    case 'sensor_linha':
      // LÓGICA AJUSTADA PARA MOSTRAR OS DOIS SENSORES (ESQUERDO E DIREITO)
      Blockly.Arduino.definitions_['pino_seguidor_direita'] = 'int pino_seguidor_direita = A2;'; // Exemplo de pino
      Blockly.Arduino.definitions_['pino_seguidor_esquerda'] = 'int pino_seguidor_esquerda = A3;'; // Exemplo de pino
      
      codigo_sensor = 'int valor_esq = analogRead(pino_seguidor_esquerda);\n' +
                      'int valor_dir = analogRead(pino_seguidor_direita);\n' +
                      'Serial.print("Esquerdo: ");\n' +
                      'Serial.print(valor_esq);\n' +
                      'Serial.print(" | Direito: ");\n' +
                      'Serial.println(valor_dir);\n';
      break;

    case 'potenciometro':
      Blockly.Arduino.definitions_['pino_pot'] = 'int DB4K_pino_analogico_potenciometro = A4;'; // Exemplo de pino
      codigo_sensor = 'int valor = analogRead(DB4K_pino_analogico_potenciometro);\n' +
                      'Serial.print("Potenciometro: ");\n' +
                      'Serial.println(valor);\n';
      break;

    case 'sensor_toque':
      Blockly.Arduino.definitions_['pino_toque'] = 'int DB4K_pino_sensor_toque = 2;'; // Exemplo de pino
      codigo_sensor = 'int valor = digitalRead(DB4K_pino_sensor_toque);\n' +
                      'Serial.print("Toque: ");\n' +
                      'Serial.println(valor);\n';
      break;
  }

  // 3. ADICIONA O DELAY E RETORNA O CÓDIGO FINAL
  // O delay evita que o monitor serial seja inundado com dados, facilitando a leitura.
  var code = codigo_sensor + 'delay(200);\n';
  return code;
};



Blockly.Arduino['delay'] = function(block) {
  var dropdown_milisegundos = block.getFieldValue('milisegundos');
  
  // TODO: Assemble Arduino into code variable.
  var code = 'delay (' + dropdown_milisegundos + ');\n';
  return code;
};


Blockly.Arduino['repetir'] = function(block) {
  var branch= Blockly.Arduino.statementToCode(block, 'blocos_dbk');
  var repeats = block.getFieldValue('numero_repeticoes');
  // TODO: Assemble Arduino into code variable.
  branch = Blockly.Arduino.addLoopTrap(branch, block.id);
  var loopVar = Blockly.Arduino.variableDB_.getDistinctName(
      'count', Blockly.Variables.NAME_TYPE);
  var code = 'for (int ' + loopVar + ' = 0; ' +
      loopVar + ' < ' + repeats + '; ' +
      loopVar + '++) {\n' +
      branch + '}\n';
  return code;
};

Blockly.Arduino['parar_repeticao_do_programa'] = function(block) {
  
  var code = 'while (true);\n';
    
  return code;
};

Blockly.Arduino['condicional_simples'] = function(block) {
  var value_condicao =  Blockly.Arduino.valueToCode(block, 'condicao',
      Blockly.Arduino.ORDER_NONE) || 'false';

  var statements_codigo_condicional = Blockly.Arduino.statementToCode(block, 'codigo_condicional');
  
  var code = 'if (' + value_condicao + ') {\n' + statements_codigo_condicional + '}';
  return code + '\n';
  
};


Blockly.Arduino['condicional_completo'] = function(block) {
  var value_condicao =  Blockly.Arduino.valueToCode(block, 'condicao',
      Blockly.Arduino.ORDER_NONE) || 'false';
  var statements_codigo_condicional = Blockly.Arduino.statementToCode(block, 'codigo_condicional');
  var statements_codigo_execcao = Blockly.Arduino.statementToCode(block, 'codigo_execcao');

  var code = 'if (' + value_condicao + ') {\n' + statements_codigo_condicional + '}';
  
  code = code + ' else {\n' + statements_codigo_execcao + '}';
  
  return code + '\n';
  
}


Blockly.Arduino['enquanto'] = function(block) {
  var value_condicao = Blockly.Arduino.valueToCode(block, 'condicao',
      Blockly.Arduino.ORDER_NONE) || 'false';
  var statements_codigo_enquanto = Blockly.Arduino.statementToCode(block, 'codigo_enquanto');
  
  
  var code = 'while(' + value_condicao + ') {\n' + statements_codigo_enquanto + '}';
  return code + '\n';
};
