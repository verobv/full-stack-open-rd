const router = require('express').Router()
const jwt = require('jsonwebtoken')
const { SECRET } = require('../util/config')
const { Op } = require('sequelize')

const { Blog, User } = require('../models')

const blogFinder = async (req, res, next) => {
  try {
    req.blog = await Blog.findByPk(req.params.id)
    
    if (!req.blog) {
        return res.status(404).end()
    }
    
    next()
  } catch (error) {
    next(error)
  }
}

const tokenExtractor = (req, res, next) => {
  const authorization = req.get('authorization')
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    try {
      req.decodedToken = jwt.verify(authorization.substring(7), SECRET)
    } catch{
      return res.status(401).json({ error: 'token invalid' })
    }
  }  else {
    return res.status(401).json({ error: 'token missing' })
  }
  next()
}

// list all blogs, allow filtering 
router.get('/', async (req, res) => {
  const where = {}

  if (req.query.search) {
    where[Op.or] = [
      {
        title: {
          [Op.iLike]: `%${req.query.search}%`
        },
      },
      {
        author: {
          [Op.iLike]: `%${req.query.search}%`
        }
      }
    ] 
  }

  const blogs = await Blog.findAll({
    attributes: { exclude: ['userId'] },
    include: {
      model: User,
      attributes: ['name']
    },
    where,
    order: [['likes', 'DESC']]
  })
  console.log(JSON.stringify(blogs, null, 2))
  res.json(blogs)
})

// add a new blog
router.post('/', tokenExtractor, async (req, res, next) => {
  try {
    const user = await User.findByPk(req.decodedToken.id)  
    
    if (!user) {
      return res.status(401).json({ error: 'user not found' })
    }
    
    const blog = await Blog.create({...req.body, userId: user.id})
    return res.json(blog)
  } catch(error) {
    next(error)
  }
})

// get one specific blog by id
router.get('/:id', blogFinder, async (req, res) => {
  res.json(req.blog)
})

// delete a blog
router.delete('/:id', blogFinder, tokenExtractor, async (req, res) => {
  const user = await User.findByPk(req.decodedToken.id)  
  
  if (!user) {
    return res.status(401).json({ error: 'user not found' })
  }

  if (req.blog.userId !== user.id) {
    return res.status(403).json({
      error: 'only the user who added the blog can delete it'
    })
  }
  
  await req.blog.destroy()
  res.status(204).end()
})

// modify likes of one specific blog
router.put('/:id', blogFinder, async (req, res, next) => {
  try {
    req.blog.likes = req.body.likes
    await req.blog.save()
    res.json(req.blog)
  } catch (error) {
    next(error)
  }
})

module.exports = router