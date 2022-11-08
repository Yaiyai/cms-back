# Cosas para personalizar cada CMS

Necesitas: heroku, cloudinary y mongo

## Server

- En las variables de entorno, las BDD : default = mongodb://localhost/nowp-cms
- En las variables de entorno, las secret del jwt : default = nowpcms_824@\*\*

## Deploy

- En el package configura el script deploy con la app de heroku y la rama desde la que haces push, ej: "heroku git:remote -a mbrapi && git push heroku mbr:main"

## Client

- En las variables de entorno, las credenciales de cloudinary : default = yaidev
- En las variables de entorno, la URL de la api : default = wp-cms.herokuapp.com/api
- Auth.action: cambiar el nombre de los elementos del localStorage : default = default-user, default-token
- DashBoardNAv: links, default : /cms-link/
- En AppRouter.jsx, en el copyright, default: CMS S.L.
- Carpeta public : el favicon
- Carpeta public/index.html : el title, default : NOWPCMS App
