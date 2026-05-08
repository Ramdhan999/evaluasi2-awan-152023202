package main

import (
	"fmt"
	"log"
	"os"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/s3/s3manager"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

// --- BAGIAN MODEL/TABEL DATABASE ---
// (Biarin aja struct User, Pengajuan, Pengaduan yang tadi udah dibikin)
type User struct {
	ID       uint   `gorm:"primaryKey"`
	Nama     string `gorm:"type:varchar(100)"`
	Email    string `gorm:"unique"`
	Password string
	Role     string `gorm:"default:warga"`
}

type Pengajuan struct {
	ID         uint `gorm:"primaryKey"`
	UserID     uint
	JenisSurat string `gorm:"type:varchar(50)"`
	Keterangan string `gorm:"type:text"`
	Status     string `gorm:"default:pending"`
}

type Pengaduan struct {
	ID          uint `gorm:"primaryKey"`
	UserID      uint
	Judul       string `gorm:"type:varchar(150)"`
	Deskripsi   string `gorm:"type:text"`
	LampiranURL string
	Status      string `gorm:"default:diterima"`
}

// -----------------------------------

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Println("Peringatan: File .env tidak ditemukan")
	}

	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local",
		os.Getenv("DB_USER"),
		os.Getenv("DB_PASS"),
		os.Getenv("DB_HOST"),
		os.Getenv("DB_PORT"),
		os.Getenv("DB_NAME"),
	)

	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Gagal konek ke RDS bro:", err)
	}
	fmt.Println("Mantap! Sukses konek ke RDS MySQL.")

	r := gin.Default()

	r.GET("/ping", func(c *gin.Context) {
		c.JSON(200, gin.H{"message": "Sipadu API is running dengan Database!"})
	})

	// --- ENDPOINT LIHAT DAFTAR PENGADUAN (ADMIN) ---
	r.GET("/pengaduan", func(c *gin.Context) {
		var daftarPengaduan []Pengaduan
		// Tarik semua data dari RDS, urutin dari yang paling baru
		result := db.Order("id desc").Find(&daftarPengaduan)

		if result.Error != nil {
			c.JSON(500, gin.H{"error": "Gagal ngambil data dari database"})
			return
		}

		c.JSON(200, gin.H{
			"pesan": "Sukses narik data",
			"data":  daftarPengaduan,
		})
	})

	// --- ENDPOINT UPLOAD PENGADUAN ---
	r.POST("/pengaduan", func(c *gin.Context) {
		judul := c.PostForm("judul")
		deskripsi := c.PostForm("deskripsi")

		// 1. Ambil file dari request
		file, header, err := c.Request.FormFile("lampiran")
		if err != nil {
			c.JSON(400, gin.H{"error": "File lampiran gagal diambil"})
			return
		}
		defer file.Close()

		// 2. Setup AWS Session
		sess, err := session.NewSession(&aws.Config{
			Region: aws.String(os.Getenv("AWS_REGION")),
		})
		if err != nil {
			c.JSON(500, gin.H{"error": "Gagal bikin AWS session"})
			return
		}

		// 3. Upload ke S3
		uploader := s3manager.NewUploader(sess)
		uploadResult, err := uploader.Upload(&s3manager.UploadInput{
			Bucket: aws.String(os.Getenv("AWS_BUCKET_NAME")),
			Key:    aws.String("uploads/" + header.Filename), // masukin ke folder uploads
			Body:   file,
			ACL:    aws.String("public-read"), // Biar ImageKit bisa baca
		})
		if err != nil {
			c.JSON(500, gin.H{"error": "Gagal upload ke S3", "detail": err.Error()})
			return
		}

		// 4. Bikin URL ImageKit (bukan URL S3)
		imageKitURL := fmt.Sprintf("%s/uploads/%s", os.Getenv("IMAGEKIT_URL"), header.Filename)

		// 5. Simpan data ke Database RDS
		pengaduan := Pengaduan{
			UserID:      1, // Hardcode ID 1 dulu buat testing
			Judul:       judul,
			Deskripsi:   deskripsi,
			LampiranURL: imageKitURL,
		}
		db.Create(&pengaduan)

		c.JSON(200, gin.H{
			"pesan":      "Mantap bro! Pengaduan berhasil disimpan.",
			"data":       pengaduan,
			"s3_raw_url": uploadResult.Location, // Cuma buat bukti aja
		})
	})
	// ---------------------------------

	r.Run(":8080")
}
