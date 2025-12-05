pipeline {
    agent any

    environment {
        // Define environment variables if needed
        COMPOSE_FILE = 'container/docker-compose.yml'
        PROJECT_NAME = 'my-webapp'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    // Build the services defined in docker-compose
                    // --build forces a rebuild of the Dockerfile inside the container folder
                    sh "docker-compose -f ${COMPOSE_FILE} -p ${PROJECT_NAME} build"
                }
            }
        }

        stage('Run Tests') {
            steps {
                script {
                    // Example: Run a specific service to execute tests
                    // --rm removes the container after execution
                    sh "docker-compose -f ${COMPOSE_FILE} -p ${PROJECT_NAME} run --rm app npm test"
                }
            }
        }

        stage('Deploy / Start') {
            steps {
                script {
                    // Start the containers in detached mode
                    sh "docker-compose -f ${COMPOSE_FILE} -p ${PROJECT_NAME} up -d"
                }
            }
        }
    }

    post {
        always {
            script {
                // Clean up containers and networks created by this build
                sh "docker-compose -f ${COMPOSE_FILE} -p ${PROJECT_NAME} down"
            }
        }
    }
}