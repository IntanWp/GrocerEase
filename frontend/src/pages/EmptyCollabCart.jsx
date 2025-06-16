import Breadcrumbs from '../components/Breadcrumbs.jsx';
import Header from '../components/Header.jsx';

const EmptyCollabCart = () => {
    return (
        <div className="checkoutresponse">
            <Header />

            <div className="profile-section">
                <Breadcrumbs 
                    items={[
                        { label: 'Home', href: '/home' },
                        { label: 'Shopping Cart', href: '/empty-cart' },
                        { label: 'Collaboration Cart', current: true}
                    ]}
                />
            </div>

            <div 
                className="EmptyNotification" 
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '300px', // adjust as needed
                    textAlign: 'center'
                }}
            >
                <hr style={{ width: '50%', marginBottom: '20px' }} />
                <p style={{ fontSize: '1.2rem', color: '#555' }}>
                    Your shopping cart is empty. Start adding items!
                </p>
            </div>
        </div>
    );
}

export default EmptyCollabCart;
