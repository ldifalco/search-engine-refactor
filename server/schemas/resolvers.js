const { AuthenticationError } = require('apollo-server-express');
const { User, Book } = require('../models');
const { findOneAndUpdate } = require('../models/User');
const { signToken } = require('../utils/auth');

const resolvers = {
    Query: {
        me: async (parent, args, context) => {
            if(context.user){
                return User.findOne({_id: context.user._id});
            }
            throw new AuthenticationError('Please log in');
        },
    },

    Mutation: {
        login: async (parent, { email, password }) => {

            const user = await User.findOne({ email });
    
            if (!user) {
                throw new AuthenticationError('No user found');
            }
    
            const correctPw = await user.isCorrectPassword(password);
    
            if (!correctPw) {
                throw new AuthenticationError('Incorrect password');
            }
    
            const token = signToken(user);
            return { token, user };
        },

        addUser: async (parent, { username, email, password }) => {
            const user = await User.create({ username, email, password });
            const token = signToken(user);

            return { token, user };
        },

        saveBook: async (parent, { bookId, authors, description, title, image, link }, context) => {
            const book = { bookId, authors, description, title, image, link };
            if(context.user){
                return User.findOneAndUpdate(
                    {_id: context.user._id},
                    {
                        $addToSet: {savedBooks: book}
                    }
                );
            }
            throw new AuthenticationError('Please log in');
        },

        removeBook: async (parent, temp, context) => {
            const {bookId} = temp;
            console.log(temp);
            if(context.user) {
                return User.findOneAndUpdate(
                    {_id: context.user._id},
                    {
                        $pull: {
                            savedBooks: {bookId}
                        }
                    },
                    {new: true}
                );
            }
            throw new AuthenticationError('Please log in');
        },
    },
};

module.exports = resolvers;