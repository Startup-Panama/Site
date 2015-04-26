Sitio de Panama Startup Way Manifesto
======

Este repositorio contiene el sitio de [Panama Startup Way Manifesto](http://panamastartupway.com/), la pagina fue generada con Jade y Stylus usando el preprocesador y server estatico [HarpJs](https://www.harpjs.com).

## Setting Up
- Instalar [Node.js](http://nodejs.org/)
- Instalar harp: `npm install -g harp`
- Arrancar el servidor de harp: `harp server`  
La aplicación debe estar corriendo en [http://localhost:9000/](http://localhost:9000/).

## Compilar Pagina
```
harp compile
sudo rm -r www/.git
```
La versión compilada va a estar en la carpeta `www`.

## Domain / Hosting
El dominio está registrado en GoDaddy, bajo la cuenta de Alexis.  
La página está hospedada en WebHostingBuzz, en un servidor de Alexis.
```
rsync -avz -e 'ssh -p 47926' --progress ./www/ xlwebsit@xlwebsites.com:/home/xlwebsit/public_html/panamastartupway.com
```
