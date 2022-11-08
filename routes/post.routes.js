const express = require('express')
const router = express.Router()
const formValidator = require('../middlewares/formValidator')
const tokenValidator = require('../middlewares/tokenValidator')
const { check } = require('express-validator')

const { getPosts, getPost, addPost, deletePost, updatePost, getUserPosts, getPostBySlug, getPostsByCategory, createSlugs } = require('./controllers/post.controller')
// api/posts
router.get('/', getPosts)
router.get('/category/:category', getPostsByCategory)
router.get('/:userID', getUserPosts)
router.get('/post/id/:postID', getPost)
router.get('/post/slug/:postSlug', getPostBySlug)

//Solo usuarios logeados pueden añadir, borrar o editar la info de la empresa
router.use(tokenValidator) //Poniendolo aqui, todas las rutas que estén por debajo, solo podrán accederse si se está validado

router.post('/', addPost)
router.put('/createSlugs', createSlugs)
router.put('/:postID', updatePost)
router.delete('/:postID', deletePost)

module.exports = router
