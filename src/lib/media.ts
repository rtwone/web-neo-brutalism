export const optimizedImageUrl = (source: string, width = 800) => {
    if (!source.includes('/storage/v1/object/public/')) return source
    return source
        .replace('/storage/v1/object/public/', '/storage/v1/render/image/public/')
        .concat(source.includes('?') ? `&width=${width}&quality=80` : `?width=${width}&quality=80`)
}

export const markImageError = (event: React.SyntheticEvent<HTMLImageElement>) => {
    event.currentTarget.hidden = true
    event.currentTarget.parentElement?.classList.add('is-image-error')
}
