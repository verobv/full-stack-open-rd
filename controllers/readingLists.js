const router = require('express').Router()
const { tokenExtractor } = require('../util/middleware')

const { User, Blog, ReadingList } = require('../models')

router.post('/', async (req, res, next) => {
  try {
    const { blogId, userId } = req.body

    if (!blogId || !userId) {
      return res.status(400).json({
        error: 'blogId and userId are required'
      })
    }

    const user = await User.findByPk(userId)

    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      })
    }

    const blog = await Blog.findByPk(blogId)

    if (!blog) {
      return res.status(404).json({
        error: 'Blog not found'
      })
    }

    const existing = await ReadingList.findOne({
      where: { userId, blogId }
    })

    if (existing) {
      return res.status(400).json({
        error: 'Blog is already in the reading list'
      })
    }

    const reading = await ReadingList.create({
      userId,
      blogId,
      read: false
    })

    res.status(201).json(reading)
  } catch(error) {
    next(error)
  }
})

router.put('/:id', tokenExtractor, async(req, res, next) => {
  try {
    const { read } = req.body

    if (typeof read !== 'boolean') {
      return res.status(400).json({
        error: 'read must be a boolean'
      })
    }

    const reading = await ReadingList.findByPk(req.params.id)

    if (!reading) {
      return res.status(404).json({
        error: 'No entry in reading list'
      })
    }

    if (reading.userId !== req.decodedToken.id) {
      return res.status(401).json({
        error: 'You can only modify your own reading list'
      })
    }

    reading.read = read
    await reading.save()

    res.json(reading)
  } catch (error) {
    next(error)
  }
})

module.exports = router