# Dockerfile for orchestration or common tasks

# Set the base image
FROM alpine:latest
RUN echo "Hello from Dockerfile! This message is printed during the image build --- 1."
WORKDIR /app
RUN echo "Hello from Dockerfile! This message is printed during the image build. ---- 2"
# Copy the backend folder
COPY main-server ./main-server
RUN echo "Hello from Dockerfile! This message is printed during the image build. --- 3"
# Copy the node_server folder
COPY email-server ./email-server
RUN echo "Hello from Dockerfile! This message is printed during the image build. --- 4"
# Copy the Nginx configuration file
COPY nginx.conf /etc/nginx/nginx.conf