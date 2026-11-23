const Blog = require('./blog')
const User = require('./user')
const ReadingList = require('./readingList')
const Session = require('./session')

User.hasMany(Blog)
Blog.belongsTo(User)

/*const syncModels = async () => {
  await User.sync({ alter: true })
  await Blog.sync({ alter: true })
}*/

User.belongsToMany(Blog, { through: ReadingList, as: 'readings' })
Blog.belongsToMany(User, { through: ReadingList, as: 'readers' })

User.hasMany(Session)
Session.belongsTo(User)

module.exports = {
  Blog, User, ReadingList, Session //, syncModels
}