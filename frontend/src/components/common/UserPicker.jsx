import { useState, useEffect } from 'preact/hooks';
import { useToast } from '../../context/ToastContext';

export default function UserPicker({ users, selectedUser = null, onSelectUser, id = "user-picker" }) {
  const [searchQuery, setSearchQuery] = useState("");
  const { showToast } = useToast();

  useEffect(() => {
    if (!selectedUser) {
      setSearchQuery("");
    } else {
      setSearchQuery(selectedUser.username);
    }
  }, [selectedUser]);

  const handleChoiceUser = (e) => {
    e.preventDefault();

    const foundUser = users.find(
      user => user.username.toLowerCase() === searchQuery.toLowerCase()
    );

    if (!foundUser) {
      showToast('Please select a valid user', 'error');
      onSelectUser(null);
      return;
    }

    onSelectUser(foundUser);
  };

  const filteredUsers = users
    .filter(user =>
      user.username.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .slice(0, 5);

  return (
    <form onSubmit={handleChoiceUser} style={{ margin: 0 }}>
      <input
        type="search"
        list={`${id}-list`}
        placeholder="Type to search user..."
        value={searchQuery}
        onChange={(e) => {
          const value = e.target.value;
          setSearchQuery(value);

          const foundUser = users.find(
            user => user.username.toLowerCase() === value.toLowerCase()
          );

          if (foundUser) {
            onSelectUser(foundUser);
          } else {
            onSelectUser(null);
          }
        }}
      />
      <datalist id={`${id}-list`}>
        {filteredUsers.map(user => (
          <option key={user.id} value={user.username} />
        ))}
      </datalist>
    </form>
  )
}