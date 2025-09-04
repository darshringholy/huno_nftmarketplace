import { User } from "lucide-react"

interface HexagonAvatarProps {
  src?: string
  alt?: string
  size?: "sm" | "md" | "lg"
  className?: string
  fallbackInitial?: string
  placeholderImage?: string
}

export default function HexagonAvatar({ 
  src, 
  alt = "Avatar", 
  size = "md",
  className = "",
  fallbackInitial,
  placeholderImage = "/images/placeholder-user.jpg"
}: HexagonAvatarProps) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10", 
    lg: "w-16 h-16"
  }

  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-8 h-8"
  }

  return (
    <div className={`relative flex-shrink-0 overflow-hidden ${sizeClasses[size]} ${className}`}>
      <svg width="100%" height="100%" viewBox="0 0 100 100">
        <polygon points="50,10 90,30 90,70 50,90 10,70 10,30" fill="#232423" />
      </svg>
      {src ? (
        <img
          src={src}
          alt={alt}
          className="absolute top-0 left-0 w-full h-full object-cover"
          style={{ clipPath: "polygon(50% 0%, 90% 20%, 90% 80%, 50% 100%, 10% 80%, 10% 20%)" }}
          onError={(e) => {
            // If the image fails to load, replace with placeholder
            const target = e.target as HTMLImageElement;
            target.src = placeholderImage;
          }}
        />
      ) : (
        <div 
          className="absolute top-0 left-0 w-full h-full flex items-center justify-center" 
          style={{ clipPath: "polygon(50% 0%, 90% 20%, 90% 80%, 50% 100%, 10% 80%, 10% 20%)" }}
        >
          <img
            src={placeholderImage}
            alt="User placeholder"
            className="w-full h-full object-cover"
            onError={(e) => {
              // If placeholder also fails, show user icon
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const parent = target.parentElement;
              if (parent) {
                const userIcon = document.createElement('div');
                userIcon.className = `w-full h-full flex items-center justify-center`;
                userIcon.innerHTML = `<svg class="${iconSizes[size]} text-gray-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>`;
                parent.appendChild(userIcon);
              }
            }}
          />
        </div>
      )}
    </div>
  )
} 