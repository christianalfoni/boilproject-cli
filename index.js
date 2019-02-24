#! /usr/bin/env node
const { exec } = require('child_process');
const fs = require('fs-extra')
const isPlainObject = require('is-plain-obj')
const path = require('path')
const firebase = require('firebase')
require("firebase/firestore");
const configuration = process.argv[2]
const configurationArray = configuration.split('/')
const username = configurationArray[0]
const configurationName = configurationArray[1]

function getFirebaseDb (config) {
  firebase.initializeApp(config);

  return firebase.firestore();
}

function deepMerge(source, target) {
  if (isPlainObject(source)) {
    return Object.keys(source).reduce((aggr, key) => Object.assign(aggr, {
      [key]: deepMerge(source[key], aggr[key])
    }), target || {})
  } else if (Array.isArray(source)) {
    return source.reduce((aggr, value) => aggr.concat(value), target || [])
  }

  return source
}

function writeFile (file) {
  const outputPath = path.resolve(file.path)

  if (!outputPath.startsWith(path.resolve())) {
    throw new Error('You can not configure paths outside of the project folder!')
  }
  
  fs.outputFileSync(file.path, file.content)
}


const db = getFirebaseDb({
  apiKey: "AIzaSyBOSII8X17PcYE_usoU4eHXzckPFVebhuc",
  authDomain: "configure-project-85b8a.firebaseapp.com",
  databaseURL: "https://configure-project-85b8a.firebaseio.com",
  projectId: "configure-project-85b8a",
  storageBucket: "configure-project-85b8a.appspot.com",
  messagingSenderId: "186256588329"
})

console.log("Downloading boilerplate from boilproject.io...")
db
  .collection("links")
  .where('username', '==', username)
  .where('name', '==', configurationName)
  .get()
  .then(snapshot => {
    const result = snapshot.docs[0] && snapshot.docs[0].data()

    if (!result) {
      throw new Error("Could not find: " + configuration)
    }

    return db.collection('profiles')
      .doc(result.uid)
      .collection('boilerplates')
      .doc(result.name)
      .get()
      .then(result => result.data())
  })
  .then((data) => {
    
    return new Promise((resolve, reject) => {
      exec('npm init --y', (error, stdout) => {
        if (error) {
          reject(error)
          return;
        }

        console.log("Creating files...")
        
        try {
          const packageJsonFromData = data.files.shift()
          const packageJson = fs.readJSONSync('./package.json')
    
          data.files.forEach(writeFile)
        
          fs.writeFileSync('./package.json', JSON.stringify(deepMerge(JSON.parse(packageJsonFromData.content || '{}'), packageJson), null, 2))
    
          resolve()
        } catch (e) {
          reject(e)
        }
      });
    })
  })
  .then(() => {
    return new Promise((resolve, reject) => {
      console.log("Installing packages...")
      exec('npm install', (error, stdout) => {
        if (error) {
          reject(error)
          return;
        }
        console.log(stdout)
        resolve()
      });
    })
  })
  .then(() => {
    console.log("Done!")
    process.exit(0)
  })
  .catch((error) => {
    console.error(error.message, error.stack)
  })