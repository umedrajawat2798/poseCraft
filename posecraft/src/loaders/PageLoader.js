/* eslint-disable no-unused-vars */
/**
 *   @akshay
 *   how to use
 *   <PageLoader fullScreen />
 */

import React from 'react'
import Proptypes from 'prop-types'

const PageLoader = React.memo(({
  fullScreen,
  isLoading,
}) => {
  if (!isLoading) return null
  const { isDark } = useTheme()
  const extraStyles = fullScreen ? {
    position: 'fixed',
    left: 0,
    top: 0,
    height: '100%',
    width: '100%',
    zIndex: '99999',
    background: isDark ? '#00000040' : '#ffffffc5',
  } : {}
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      position: 'relative',
      justifyContent: 'center',
      ...extraStyles,
    }}
    >
      <img src="../gif/circle_loader.gif" alt="...loading" style={{ width: 60, backgroundColor: 'transparent' }} />
    </div>

  )
})

export default PageLoader

PageLoader.defaultProps = {
  // color: 'blue',
  isLoading: true,
}

PageLoader.proptypes = {
  color: Proptypes.string,
}
