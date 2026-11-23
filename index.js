const express = require('express')
const app = express()

const { PORT } = require('./util/config')
const { connectToDatabase } = require('./util/db')
const { Blog, User, ReadingList, Session } = require('./models')

const blogsRouter = require('./controllers/blogs')
const usersRouter = require('./controllers/users')
const authorsRouter = require('./controllers/authors')
const loginRouter = require('./controllers/login')
const logoutRouter = require('./controllers/logout')
const readingListsRouter = require('./controllers/readingLists')

const errorHandler = (error, req, res, next) => {
  console.error(error.message)

  if (
    error.name === 'SequelizeValidationError' ||
    error.name === 'SequelizeUniqueConstraintError'
  ) {
    return res.status(400).json({ 
      error: error.errors.map(e => e.message) 
    })
  } 

  next(error)
}

app.use(express.json())

app.get('/', (req, res) => {
  res.status(200).send('OK')
})

app.post('/api/reset', async (req, res, next) => {
  try {
    await Blog.destroy({
      where: {},
      truncate: true,
      cascade: true
    })
    await User.destroy({
      where: {},
      truncate: true,
      cascade: true
    })
    await Session.destroy({
      where: {},
      truncate: true,
      cascade: true
    })
    await ReadingList.destroy({
      where: {},
      truncate: true,
      cascade: true
    })
    res.status(204).end()
  } catch (error) {
    next(error)
  }
})

app.use('/api/blogs', blogsRouter)
app.use('/api/users', usersRouter)
app.use('/api/authors', authorsRouter)
app.use('/api/login', loginRouter)
app.use('/api/logout', logoutRouter)
app.use('/api/readinglists', readingListsRouter)

// this has to be the last loaded middleware, also all the routes should be registered before this!
app.use(errorHandler)

const start = async () => {
  await connectToDatabase()
  // await syncModels()
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })
}

start()