

export default function ProfileView({ userData, avatarUrl }) {
  return (
    <>
      <img
        src={avatarUrl || '/default_ava.jpg'}
        alt="User Avatar"
        style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover' }}
      />

      <h3>Username:</h3>
      <p>{userData.username}</p>

      <h3>Email:</h3>
      <p>{userData.email}</p>

      <h3>Bio:</h3>
      <p>{userData.bio}</p>

      <h3>Birthday date:</h3>
      <p>{userData.birthday_date}</p>
    </>
  )
}