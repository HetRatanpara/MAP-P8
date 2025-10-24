pipeline {
  agent any
  environment {
    REGISTRY = "localhost:5000"
    IMAGE = "${REGISTRY}/sample-node-app"
    // Optional: set the credentials ID in Jenkins (create a 'Username with password' or Docker Registry credential)
    REGISTRY_CREDENTIALS = "registry-creds"
  }
  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }
    stage('Install & Test') {
      steps {
        sh 'cd app && npm ci'
        sh 'cd app && npm test'
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
