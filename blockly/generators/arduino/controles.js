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
  var codigo_sensor;
  var pino;

  switch(sensor) {
    case 'sensor_luz':
      pino = 'DB4K_pino_analogico_LDR_luz'; // Atualizado para a variável correta
      codigo_sensor = 'int valor = analogRead(' + pino + ');\n';
      codigo_sensor += 'Serial.print("Luz: ");\n';
      codigo_sensor += 'Serial.println(valor);\n';
      break;
    case 'sensor_temperatura':
      pino = 'DB4K_pino_analogico_sensor_temperatura'; // Atualizado para a variável correta
      codigo_sensor = 'int valor = analogRead(' + pino + ');\n';
      codigo_sensor += 'Serial.print("Temperatura: ");\n';
      codigo_sensor += 'Serial.println(valor);\n';
      break;
    case 'sensor_distancia':
      pino = 'DB4K_pino_ultrasonic_echo'; // Atualizado para a variável correta
      codigo_sensor = 'int valor = analogRead(' + pino + ');\n';
      codigo_sensor += 'Serial.print("Distância: ");\n';
      codigo_sensor += 'Serial.println(valor);\n';
      break;
    case 'sensor_linha':
      pino = 'DB4K_pino_analogico_sensor_linha_direito'; // Atualizado para a variável correta
      codigo_sensor = 'int valor = analogRead(' + pino + ');\n';
      codigo_sensor += 'Serial.print("Linha: ");\n';
      codigo_sensor += 'Serial.println(valor);\n';
      break;
    case 'potenciometro':
      pino = 'DB4K_pino_analogico_potenciometro'; // Atualizado para a variável correta
      codigo_sensor = 'int valor = analogRead(' + pino + ');\n';
      codigo_sensor += 'Serial.print("Potenciômetro: ");\n';
      codigo_sensor += 'Serial.println(valor);\n';
      break;
    case 'sensor_toque':
      pino = 'DB4K_pino_sensor_toque'; // Atualizado para a variável correta
      codigo_sensor = 'int valor = digitalRead(' + pino + ');\n';
      codigo_sensor += 'Serial.print("Toque: ");\n';
      codigo_sensor += 'Serial.println(valor);\n';
      break;
  }

  var code = 'Serial.begin(9600);\n' + codigo_sensor;
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
