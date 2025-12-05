pipeline {
    agent any

    environment {
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
                    sh "docker compose -f ${COMPOSE_FILE} -p ${PROJECT_NAME} build"
                }
            }
        }

        stage('Run Tests') {
            steps {
                script {
                    sh "docker compose -f ${COMPOSE_FILE} -p ${PROJECT_NAME} run --rm app npm test"
                }
            }
        }

        stage('Deploy / Start') {
            steps {
                script {
                    sh "docker compose -f ${COMPOSE_FILE} -p ${PROJECT_NAME} up -d"
                }
            }
        }
    }

    post {
        always {
            script {
                sh "docker compose -f ${COMPOSE_FILE} -p ${PROJECT_NAME} down"
            }
        }
    }
}