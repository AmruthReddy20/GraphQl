const { ApolloServer,gql } = require("apollo-server");

const data = require("./data.json");

const {v4:uuid} = require('uuid')

const typeDefs = `
type Tweet {
    id: ID!
    body: String
    date: Date
    author: User
    stats: Stat
 }
 
 type User {
    id: ID!
    username: String
    first_name: String
    last_name: String
    full_name: String
    avatar_url: Url
 }
 
 type Stat {
    views: Int
    likes: Int
    retweets: Int
    responses: Int
}

type Notification {
    id: ID
    date: Date
    type: String
 }
 
 type Meta {
    count: Int
 }

 scalar Url
 scalar Date
 
 
 type Query {
    tweet(id: ID!): Tweet
    tweets(limit: Int, skip: Int, sort_field: String, sort_order: String): [Tweet]
    tweetsMeta: Meta
    user(id: ID!): User
    notifications(limit: Int): [Notification]
}

type Mutation {
    createTweet (
        body: String
    ): Tweet
    deleteTweet(id: ID!): Tweet
    markTweetRead(id: ID!): Boolean
 }`


 const user = {
    "id": "u002",
    "username": "max",
    "first_name": "Max",
    "last_name": "Well",
    "full_name": "Max Well",
    "avatar_url": "avatarurl2"
}

const stats = {
    "views": 0,
    "likes": 0,
    "retweets": 0,
    "reponses": 0
}


const sort=(tweets,sort_field)=>{
     return tweets.sort(function(tweet1,tweet2){
         return tweet1[sort_field]>tweet2[sort_field];
     });
}


 const resolvers={
    Query:{
        tweet:(parent,args,context)=>{
            const tweetId=args.id;
            let tweets=data.tweets;
           return tweets.find((tweet)=>tweet.id==tweetId);
        },
        tweets:(parent,{limit,sort_field,sort_order},context)=>{
            let tweets=data.tweets;
               tweets=sort(tweets,sort_field);
             return sort_order=='asc'?tweets.slice(0,limit): tweets.reverse().slice(0,limit);

        },
        tweetsMeta:()=>{
           return data.tweets_meta;
       },
       user:(parent,args,context)=>{
        const userId=args.id;
       return data.users.find((user)=>user.id==userId);
          },
          notifications:(parent,args,context)=>{
           return data.notifications.slice(0,args.limit);
              },
    },
   
    Mutation:{
      
        createTweet:(parent,args,context)=>{
            const newTweet = {
                id: uuid(),
                body: "Iam a new Tweet",
                date: new Date(),
                author: user,
            }
                  data.tweets.push(newTweet);
                  return newTweet;
               
        },
        deleteTweet:(parent,{id},context)=>{
            const tweets=data.tweets;
            tweets= tweets.filter(item => item.id !== id);
            return tweets;
        },
        markTweetRead:(parent,{id},context)=>{
             const tweets=data.tweets;
            for(let i=0;i<tweets.length;i++){
                if(tweets[i].id==id){
                    tweets[i].stats.views++;
                    return true;
                }
            }
            return false;

        }

      

       }

}

const server=new ApolloServer({
    typeDefs,resolvers, csrfPrevention: true
}); 

server.listen().then(({url})=>{
    console.log("The server is running at "+url);
});
 