pipeline {
  agent any
  options {
    // Prevent Declarative from doing an automatic checkout before our stages
    skipDefaultCheckout()
  }
  environment {
    REGISTRY = "localhost:5000"
    IMAGE = "${REGISTRY}/sample-node-app"
    // Optional: set the credentials ID in Jenkins (create a 'Username with password' or Docker Registry credential)
    REGISTRY_CREDENTIALS = "registry-creds"
  }
  stages {
    stage('Checkout') {
      steps {
        // Ensure workspace is clean to avoid 'not in a git directory' errors
        deleteDir()
        checkout scm
      }
    }
    stage('Install & Test') {
      steps {
        // Run tests inside an official Node image so 'npm' is available
        // Mount the workspace's app directory into a transient node container
        // If package-lock.json exists use `npm ci` for reproducible installs,
        // otherwise fall back to `npm install` so the build doesn't fail.
        sh '''
          docker run --rm \
            -v ${WORKSPACE}/app:/usr/src/app \
            -w /usr/src/app \
            node:18-alpine \
            sh -c "if [ -f package-lock.json ]; then npm ci; else npm install; fi && npm test"
        '''
      }
    }
    stage('Build Image') {
      steps {
        // Build an immutable image tagged with the Jenkins build number
        sh 'docker build -t ${IMAGE}:${BUILD_NUMBER} app'
        // Also tag as latest for convenience (optional)
        sh 'docker tag ${IMAGE}:${BUILD_NUMBER} ${IMAGE}:latest'
      }
    }
    stage('Push Image') {
      steps {
        // If credentials are configured in Jenkins, login first
        script {
          if (env.REGISTRY_CREDENTIALS) {
            withCredentials([usernamePassword(credentialsId: env.REGISTRY_CREDENTIALS, usernameVariable: 'REG_USER', passwordVariable: 'REG_PSW')]) {
              sh 'echo $REG_PSW | docker login -u $REG_USER --password-stdin ${REGISTRY}'
            }
          }
        }
        sh 'docker push ${IMAGE}:${BUILD_NUMBER}'
        sh 'docker push ${IMAGE}:latest'
      }
    }
    stage('Deploy Staging') {
      steps {
        // Use the specific BUILD_NUMBER tag for an immutable deployment
        sh 'IMAGE_TAG=${BUILD_NUMBER} docker-compose -f deploy/staging/docker-compose.yml pull'
        sh 'IMAGE_TAG=${BUILD_NUMBER} docker-compose -f deploy/staging/docker-compose.yml up -d'
      }
    }
  }
  post {
    always {
      archiveArtifacts artifacts: 'app/**/coverage*, **/*.log', allowEmptyArchive: true
    }
  }
}
