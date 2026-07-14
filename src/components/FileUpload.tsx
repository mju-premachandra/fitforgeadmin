import { useRef } from 'react'



interface FileUploadProps {

  label: string

  description?: string

  accept: string

  preview: string | null

  previewType?: 'image' | 'video'

  onFileSelect: (file: File) => void

  onClear: () => void

  error?: string | null

}



export default function FileUpload({

  label,

  description,

  accept,

  preview,

  previewType = 'image',

  onFileSelect,

  onClear,

  error,

}: FileUploadProps) {

  const inputRef = useRef<HTMLInputElement>(null)



  return (

    <div className="space-y-2">

      <div>

        <label className="block text-sm font-medium text-fg-secondary">{label}</label>

        {description && (

          <p className="mt-0.5 text-xs text-fg-muted">{description}</p>

        )}

      </div>



      {preview ? (

        <div className="relative overflow-hidden rounded-xl border border-input-border bg-card">

          {previewType === 'video' ? (

            <video

              src={preview}

              controls

              className="aspect-video w-full object-cover"

            />

          ) : (

            <img

              src={preview}

              alt={`${label} preview`}

              className="aspect-[3/4] w-full object-contain bg-surface-900"

            />

          )}

          <button

            type="button"

            onClick={onClear}

            className="absolute right-2 top-2 rounded-lg bg-overlay px-2.5 py-1 text-xs font-medium text-fg backdrop-blur hover:bg-red-600/90 hover:text-white"

          >

            Remove

          </button>

        </div>

      ) : (

        <button

          type="button"

          onClick={() => inputRef.current?.click()}

          className={`flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-8 transition-colors ${

            error

              ? 'border-red-500/60 bg-red-500/5 hover:border-red-400'

              : 'border-input-border bg-upload hover:border-brand-500 hover:bg-hover/60'

          }`}

        >

          <svg

            className="mb-2 h-8 w-8 text-fg-subtle"

            fill="none"

            viewBox="0 0 24 24"

            stroke="currentColor"

            strokeWidth={1.5}

          >

            <path

              strokeLinecap="round"

              strokeLinejoin="round"

              d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"

            />

          </svg>

          <span className="text-sm font-medium text-fg-secondary">

            Click to upload

          </span>

          <span className="mt-1 text-xs text-fg-subtle">

            {previewType === 'video' ? 'MP4, WebM (max 50MB)' : 'PNG, JPG, WebP (max 10MB)'}

          </span>

        </button>

      )}



      <input

        ref={inputRef}

        type="file"

        accept={accept}

        className="hidden"

        onChange={(e) => {

          const file = e.target.files?.[0]

          if (file) onFileSelect(file)

          e.target.value = ''

        }}

      />



      {error && <p className="text-xs text-red-400">{error}</p>}

    </div>

  )

}


