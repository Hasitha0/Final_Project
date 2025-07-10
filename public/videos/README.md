# Hero Background Video

## 📹 Video Requirements

### **File Specifications:**
- **Duration**: 8 seconds (as requested)
- **Format**: MP4 (primary) and WebM (fallback)
- **Naming**: 
  - `hero-background.mp4`
  - `hero-background.webm` (optional but recommended)

### **Recommended Video Settings:**
- **Resolution**: 1920x1080 (Full HD) minimum
- **Aspect Ratio**: 16:9
- **Frame Rate**: 30fps
- **Codec**: H.264 for MP4, VP9 for WebM
- **File Size**: Keep under 5MB for good loading performance

## 🎬 **Content Suggestions:**
For an eco-tech/waste management website, consider:
- Clean environmental scenes (nature, recycling processes)
- Subtle motion (flowing water, gentle wind through trees)
- Technology elements (sorting machines, clean facilities)
- Avoid busy or distracting content that competes with text

## 🚀 **Implementation:**
1. Add your video files to this folder
2. The component automatically loops the video
3. Fallback gradient background shows if video fails to load
4. Dark overlay ensures text readability

## 📱 **Browser Support:**
- ✅ Modern browsers support autoplay for muted videos
- ✅ Mobile browsers will show fallback on some devices
- ✅ Graceful degradation to gradient background

## 🎯 **Performance Tips:**
- Compress your video for web delivery
- Consider using WebM format for better compression
- The video will automatically loop every 8 seconds
- Muted autoplay ensures no user interruption 