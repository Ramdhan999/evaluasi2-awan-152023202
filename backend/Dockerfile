# Stage 1: Build aplikasinya
FROM golang:1.22-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
# Build aplikasi Go jadi file binary namanya 'main'
RUN CGO_ENABLED=0 GOOS=linux go build -o main .

# Stage 2: Bikin image akhir yang super ringan
FROM alpine:latest
WORKDIR /root/
# Copy file binary dari stage 1
COPY --from=builder /app/main .
# Expose port yang dipake Gin
EXPOSE 8080
# Jalanin aplikasinya
CMD ["./main"]