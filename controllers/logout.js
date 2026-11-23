const router = require('express').Router()
const { tokenExtractor } = require('../util/middleware')
const { Session } = require('../models')

router.delete('/', tokenExtractor, async (request, response, next) => {
  try {
    await Session.destroy({
      where: {
        userId: request.decodedToken.id
      }
    })

    response.status(204).end()
  } catch (error) {
    next(error)
  }
})

module.exports = router