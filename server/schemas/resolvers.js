const { AuthenticationError } = require('apollo-server-express');
const { User } = require('../models');
const { signToken } = require('../utils/auth');

const resolvers = {
    Query: {
        me: async(parent, args, context) => {
            if (context.user) {
                const userData = await User.findOne({ _id: context.user_id})
                .select('-__v -password')
                return userData;
            }
            throw new AuthenticationError('Please log in first')
        }
    },

    Mutation: {
        login: async(parent, { email, password }) =>{
            const user = await User.findOne({ email });
            if (!user || user.password !== password) {
                throw new AuthenticationError('Incorrect username or password')
            }
            const token = signToken(user);
            return { token, user };
        }, 
        addUser: async(parent, { username, email, password }) =>{
            const user = await User.findOne({ username, email, password});
            const token = signToken(user);
            return { token, user };
        },
        saveBook: async(parent, { BookData }, context) =>{
            if(context.user) {
                const updateSaveBook = await User.findOneAndUpdate(
                    { _id: context.user_id },
                    { $push: { savedBooks: BookData } },
                    { new: true, runValidators: true }
                );
                return updateSaveBook
            }
            throw new AuthenticationError('Please log in first')
        }, 
        removeBook: async(parent, { bookId }, context) =>{
            if(context.user) {
                const updateSaveBook = await User.findOneAndUpdate(
                    { _id: context.user_id },
                    { $push: { savedBooks: {bookId} } },
                    { new: true }
                );
                return updateSaveBook
            }
            throw new AuthenticationError('Please log in first')
        }, 
    }
}

module.exports = resolvers;