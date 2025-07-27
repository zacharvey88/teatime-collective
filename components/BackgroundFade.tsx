interface BackgroundFadeProps {
  fromColor: string
  toColor: string
  height?: string
}

const BackgroundFade = ({ fromColor, toColor, height = 'h-10' }: BackgroundFadeProps) => {
  return (
    <div 
      className={`w-full ${height}`}
      style={{
        background: `linear-gradient(to bottom, ${fromColor}, ${toColor})`
      }}
    />
  )
}

export default BackgroundFade 