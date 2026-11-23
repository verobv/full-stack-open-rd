const router = require('express').Router()

const { User, Blog } = require('../models')

router.get('/', async (req, res, next) => {
  try {
    const users = await User.findAll({    
      include: {
        model: Blog,
        attributes: {
          exclude: ['userId']
        }
      }  
    })
    res.json(users)
  } catch (error) {
    next(error)
  }
})

router.post('/', async (req, res, next) => {
  try {
    const { name, username } = req.body

    const user = await User.create({
      name,
      username
    })

    res.json(user)
  } catch(error) {
    next(error)
  }
})

router.get('/:id', async (req, res, next) => {
  try {
    const { read } = req.query

    const filter = {}

    if (read === 'true'){
      filter.read = true
    } else if (read === 'false'){
      filter.read = false
    }

    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: [''] } ,
      include:{
        model: Blog,
        as: 'readings',
        attributes: [ 'id', 'url', 'title', 'author', 'likes', 'year' ],
        through: {
          attributes: ['id', 'read'],
          where: filter
        }
      }
    })
    if (user) {
        res.json(user)
    } else {
        res.status(404).end()
    }
  } catch(error) {
    next(error)
  }
})

router.put('/:username', async (req, res, next) => {
    try {
      const user = await User.findOne({
        where: {
            username: req.params.username
        }
      })

      if(!user) {
        return res.status(404).end()
      }

      user.name = req.body.name
      await user.save()
      res.json(user)
    } catch (error) {
      next(error)
    }
})

router.delete('/:id', async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id)
    await user.destroy()
    res.status(204).end()
  } catch (error) {
    next(error)
  }
})

module.exports = router