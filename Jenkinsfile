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
        // Run npm install/test directly inside Jenkins container (node installed in custom Jenkins image)
        sh '''
          cd app
          if [ -f package-lock.json ]; then npm ci; else npm install; fi
          npm test
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
        // If credentials are configured in Jenkins, attempt to login first.
        // If the credential ID is missing, proceed but warn instead of failing the build
        script {
          if (env.REGISTRY_CREDENTIALS) {
            try {
              withCredentials([usernamePassword(credentialsId: env.REGISTRY_CREDENTIALS, usernameVariable: 'REG_USER', passwordVariable: 'REG_PSW')]) {
                sh 'echo $REG_PSW | docker login -u $REG_USER --password-stdin ${REGISTRY}'
              }
            } catch (err) {
              echo "Registry credentials with ID '${env.REGISTRY_CREDENTIALS}' not found or unusable — skipping docker login. If your registry requires auth, add credentials in Jenkins with that ID. Error: ${err}"
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
  // Use `docker compose` (plugin) instead of legacy `docker-compose` binary
  sh 'IMAGE_TAG=${BUILD_NUMBER} docker compose -f deploy/staging/docker-compose.yml pull'
  sh 'IMAGE_TAG=${BUILD_NUMBER} docker compose -f deploy/staging/docker-compose.yml up -d'
      }
    }
  }
  post {
    always {
      archiveArtifacts artifacts: 'app/**/coverage*, **/*.log', allowEmptyArchive: true
    }
  }
}
