# Lab 19 — Nostr: notas firmadas y múltiples relays

Sesión 22.

## Título y objetivo

Comprender identidad, integridad y distribución de notas Nostr mediante un fixture público y cuatro relays modelados.

## Instrucciones

En este laboratorio trabajamos en Visual Studio Code para desarrollar una presentación sobre identidad criptográfica y publicación de notas en Nostr utilizando únicamente contenido de prueba. Construimos un evento de tipo uno con clave pública, timestamp, etiquetas y contenido, calculamos su identificador mediante la serialización definida por NIP-01 y generamos una firma Schnorr de referencia con material de prueba mantenido temporalmente en memoria, sin persistir claves secretas. Implementamos la comprobación criptográfica local de ese evento y de dos variantes predefinidas, mostrando cómo alterar un carácter cambia el identificador y cómo conservar una firma antigua provoca una verificación fallida incluso si recalculamos el identificador. Describimos el flujo de publicación hacia relay.damus.io, nos.lol, nostr.wine y un relay de clase, cuyo endpoint no se inventa cuando no ha sido proporcionado. Presentamos una tabla de respuestas ilustrativas de aceptación o rechazo, la consulta por identificador y la distinción entre almacenamiento, conectividad y política de cada relay. Modelamos el bloqueo de una clave pública en el destino de clase y comparamos la recuperación desde otros relays sin atribuir un bloqueo real. Cerramos con una reflexión académica de tres líneas sobre resistencia a la censura, disponibilidad y permanencia, y entregamos HTML, CSS, JavaScript, fixture público y README con controles accesibles, fuentes y conclusiones sobre integridad y distribución.

## Descripción del trabajo

El verificador local comprueba hash y Schnorr. Dos variantes cambian contenido o recalculan id sin firmar. El mapa de relays simula bloqueo en clase y caída de otros destinos, con respuestas de protocolo identificadas como ilustrativas.

## Tecnologías

NIP-01, JSON canónico, SHA-256, firmas BIP-340 sobre secp256k1 y relays WebSocket conceptuales. BigInt y Web Crypto realizan verificaciones educativas.

## Resultados

La nota original tiene firma válida; las variantes fallan integridad o firma. El fixture contiene únicamente campos públicos y el secreto no se conserva. El bloqueo de clase y todas las respuestas de relays son simulaciones; no se publicó contenido externo.

## Aprendizaje

Aprendimos a reconstruir un evento Nostr y a distinguir hashing, firma y publicación. La alteración de un carácter mostró por qué la integridad requiere verificación criptográfica, mientras que el modelo de relays nos permitió comprender que una identidad portable todavía depende de copias accesibles y buena higiene de claves.

## Visualización

Abrimos la carpeta WEB3-LABS en Visual Studio Code. Con la extensión Live Server instalada, hacemos clic derecho en este index.html y elegimos **Open with Live Server**. La navegación principal está en ../index.html. Usamos localhost para Web Crypto; no se necesitan cuentas ni credenciales. Los controles se operan con Tab, Enter y Espacio.

## Rúbrica original

- Tabla completa de relays y respuestas: 35%.
- Evidencia del bloqueo en el relay de clase: 20%.
- Comprobación de firma digital original y modificada: 20%.
- Reflexión académica de tres líneas: 15%.
- Higiene de claves y cumplimiento de límites: 10%.

Total: 100%. Los alcances y límites se describen en la tabla HTML; no se asignan calificaciones por ejecuciones no realizadas.

## Alcance académico

Las simulaciones se identifican en pantalla; no representan conexiones, publicaciones ni transacciones externas. No se proporcionaron penalizaciones adicionales y no se inventan deducciones. contenido exclusivamente de prueba; sin mostrar ni almacenar claves secretas; bloqueo y respuestas externas nunca atribuidos a ejecuciones no realizadas.

## Fuentes primarias

- [Nostr · NIP-01](https://github.com/nostr-protocol/nips/blob/master/01.md)
- [Bitcoin · BIP-340 Schnorr](https://github.com/bitcoin/bips/blob/master/bip-0340.mediawiki)
- [Nostr · políticas e información NIP-11](https://github.com/nostr-protocol/nips/blob/master/11.md)
