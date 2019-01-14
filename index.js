#! /usr/bin/env node
const { exec } = require('child_process');
const configs = require('./configs')
const fs = require('fs-extra')
const isPlainObject = require('is-plain-obj')
const firebase = require('firebase')
require("firebase/firestore");
const configuration = process.argv[2]
const configurationArray = configuration.split('/')
const username = configurationArray[0]
const configurationName = configurationArray[1]

function getFirebaseDb (config) {
  firebase.initializeApp(config);

  const db = firebase.firestore();

  db.settings({
    timestampsInSnapshots: true
  });

  return db
}

function deepMerge(source, target) {
  if (isPlainObject(source)) {
    return Object.keys(source).reduce((aggr, key) => Object.assign(aggr, {
      [key]: deepMerge(source[key], target[key])
    }), target || {})
  } else if (Array.isArray(source)) {
    return source.reduce((aggr, value) => aggr.concat(value), target || [])
  }

  return source
}

function writeFile (file) {
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

console.log("Grabbing configuration...")
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
      .collection('configurations')
      .doc(result.name)
      .get()
      .then(result => result.data())
  })
  .then((data) => {
    console.log("Installing packages...")
    
    return new Promise((resolve, reject) => {
      exec('npm init --y && npm install ' + data.packages.join(' '), (error, stdout) => {
        if (error) {
          reject(error)
          return;
        }
        console.log(stdout);
        try {
          const packageJson = fs.readJSONSync('./package.json')
    
          data.files.forEach(writeFile)
        
          fs.writeFileSync('./package.json', JSON.stringify(deepMerge(JSON.parse(data.packageJson || '{}'), packageJson), null, 2))
    
          console.log("Written config files!")
          resolve()
        } catch (e) {
          reject(e)
        }
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