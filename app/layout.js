import SideNav from "./SideNav"
import '../styles/mui.css'

export default function RootLayout({ children }) {
  return (
    <html>
      <head />
      <body style={mainLayout}>
        <nav style={sideNav}>
          <SideNav />
        </nav>
        <div style={mainLayoutContent}>
          {children}
        </div>
      </body>
    </html>
  )
}

const sideNav = {
  backgroundColor: '#f3f6fc',
  width: '88px',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  overflowY: 'auto',
  position: 'fixed',
  margin: '0',
}

const mainLayout = {
  display: 'flex',
  minHeight: '100vh',
}

const mainLayoutContent = {
  flex: '1',
  padding: '0 20px',
  marginLeft: '88px',
}