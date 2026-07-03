import React, { useState, useEffect, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Switch, Alert, Linking, ActivityIndicator,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '../hooks/useTheme';
import { logout, loginSuccess } from '../store/slices/authSlice';
import Card from '../components/common/Card';
import Avatar from '../components/common/Avatar';
import apiClient from '../api/client';
import MapAddressPicker from '../components/MapAddressPicker';
import Svg, { Path, Circle, Line } from 'react-native-svg';


const EyeIcon = ({ visible, color = '#94a3b8', size = 20 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
      stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"
    />
    <Circle cx="12" cy="12" r="3" stroke={color} strokeWidth={1.8} />
    {!visible && (
      <Line x1="2" y1="2" x2="22" y2="22" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    )}
  </Svg>
);
// ─── Validation helpers ───────────────────────────────────────────────────────

const isValidPersonName = (v) => /^[A-Za-z\s]+$/.test(v.trim()) && v.trim().length > 0;
const isValidLocalPhone = (v) => /^\d{9}$/.test(v);

const getPasswordStrength = (pw) => {
  if (!pw) return { score: 0, label: '', color: '#94a3b8' };
  let score = 0;
  if (pw.length >= 8)           score++;
  if (/[A-Z]/.test(pw))        score++;
  if (/[0-9]/.test(pw))        score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const map = {
    1: { label: 'Weak',   color: '#ef4444' },
    2: { label: 'Fair',   color: '#f59e0b' },
    3: { label: 'Good',   color: '#10b981' },
    4: { label: 'Strong', color: '#6366f1' },
  };
  return { score, ...(map[score] ?? { label: '', color: '#94a3b8' }) };
};

const getPasswordErrors = (pw) => {
  const e = [];
  if (!pw || pw.length < 8)             e.push('At least 8 characters');
  if (!pw || !/[A-Z]/.test(pw))         e.push('At least 1 uppercase letter');
  if (!pw || !/[0-9]/.test(pw))         e.push('At least 1 number');
  if (!pw || !/[^A-Za-z0-9]/.test(pw))  e.push('At least 1 special character');
  return e;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const stripPhone = (raw = '') => {
  const d = raw.replace(/\D/g, '');
  if (d.startsWith('94') && d.length === 11) return d.slice(2);
  if (d.startsWith('0')  && d.length === 10) return d.slice(1);
  return d.slice(0, 9);
};

const formatPhoneDisplay = (raw = '') => {
  const d = raw.replace(/\D/g, '');
  if (d.startsWith('94') && d.length === 11) return `+94 ${d.slice(2)}`;
  if (d.startsWith('0')  && d.length === 10) return `+94 ${d.slice(1)}`;
  if (d.length === 9) return `+94 ${d}`;
  return raw;
};

const getRoleBadge = (role) => ({
  buyer:  { label: 'Buyer',  color: '#10b981' },
  seller: { label: 'Seller', color: '#6366f1' },
  driver: { label: 'Driver', color: '#f59e0b' },
}[role] ?? { label: role, color: '#94a3b8' });

const renderStars = (val) => '★'.repeat(val) + '☆'.repeat(5 - val);

// ─── Role-based menu config ───────────────────────────────────────────────────

const getMenuItems = (role) => {
  const edit          = { id: 'edit',          icon: '👤', title: 'Edit Profile',      desc: 'Update your name and phone number'         };
  const password      = { id: 'password',      icon: '🔐', title: 'Change Password',   desc: 'Update your account password'             };
  const notifications = { id: 'notifications', icon: '🔔', title: 'Notifications',     desc: 'Control alerts and reminders'             };
  const help          = { id: 'help',          icon: '❓', title: 'Help & Support',    desc: 'Get support or contact us'                };
  const terms         = { id: 'terms',         icon: '📄', title: 'Terms & Privacy',   desc: 'Privacy policy and terms of service'      };
  const danger        = { id: 'danger',        icon: '⚠️', title: 'Danger Zone',       desc: 'Delete your account permanently' };

  if (role === 'buyer') return [
    edit,
    password,
    { id: 'address',  icon: '📍', title: 'Delivery Address',  desc: 'Your saved delivery location'              },
    { id: 'payments', icon: '💳', title: 'Payment Methods',   desc: 'Cards and wallet preferences'              },
    { id: 'wishlist', icon: '❤️', title: 'Wishlist',          desc: 'Items you saved for later'                 },
    { id: 'reviews',  icon: '⭐', title: 'My Reviews',        desc: 'Reviews you have submitted'                },
    notifications,
    help,
    terms,
    danger,
  ];

  if (role === 'seller') return [
    edit,
    password,
    { id: 'business', icon: '🏪', title: 'Business Info',     desc: 'Update your business name and address'     },
    { id: 'reviews',  icon: '⭐', title: 'Product Reviews',   desc: 'Customer feedback on your products'        },
    notifications,
    help,
    terms,
    danger,
  ];

  // driver
  return [
    edit,
    password,
    { id: 'vehicle',       icon: '🚗', title: 'Vehicle Info',       desc: 'Your registered vehicle details'           },
    { id: 'availability',  icon: '📅', title: 'Availability',       desc: 'Set your active delivery hours'            },
    notifications,
    help,
    terms,
    danger,
  ];
};

// ─── Shared field components ──────────────────────────────────────────────────

const Lbl = ({ text, theme }) => (
  <Text style={[sh.label, { color: theme.colors.text.secondary }]}>{text}</Text>
);

const Fld = ({ value, onChange, placeholder, theme, keyboardType, maxLength, multiline, secureTextEntry, autoCapitalize, editable = true }) => (
  <TextInput
    style={[
      sh.input,
      { color: theme.colors.text.primary, borderColor: theme.colors.border },
      multiline && { height: 80, textAlignVertical: 'top' },
      !editable && { opacity: 0.5 },
    ]}
    value={value}
    onChangeText={onChange}
    placeholder={placeholder}
    placeholderTextColor={theme.colors.text.tertiary}
    keyboardType={keyboardType}
    maxLength={maxLength}
    multiline={multiline}
    secureTextEntry={secureTextEntry}
    autoCapitalize={autoCapitalize ?? 'sentences'}
    editable={editable}
  />
);

const ErrTxt = ({ msg }) => msg ? <Text style={sh.errTxt}>{msg}</Text> : null;
const OkTxt  = ({ msg }) => msg ? <Text style={sh.okTxt}>{msg}</Text>  : null;

const PrimaryBtn = ({ label, onPress, disabled, theme }) => (
  <TouchableOpacity
    style={[sh.primaryBtn, { backgroundColor: theme.colors.primary.main }, disabled && { opacity: 0.55 }]}
    onPress={onPress}
    disabled={disabled}
    activeOpacity={0.8}
  >
    {disabled
      ? <ActivityIndicator color="#fff" />
      : <Text style={sh.primaryBtnTxt}>{label}</Text>
    }
  </TouchableOpacity>
);

const OutlineBtn = ({ label, onPress, theme }) => (
  <TouchableOpacity
    style={[sh.outlineBtn, { borderColor: theme.colors.border }]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <Text style={[sh.outlineBtnTxt, { color: theme.colors.text.primary }]}>{label}</Text>
  </TouchableOpacity>
);

const ToggleRow = ({ label, sub, value, onChange, theme }) => (
  <Card style={sh.toggleCard}>
    <View style={sh.toggleRow}>
      <View style={{ flex: 1, marginRight: 12 }}>
        <Text style={[sh.toggleTitle, { color: theme.colors.text.primary }]}>{label}</Text>
        {sub ? <Text style={[sh.toggleSub, { color: theme.colors.text.secondary }]}>{sub}</Text> : null}
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        thumbColor="#fff"
        trackColor={{ false: theme.colors.border, true: theme.colors.primary.main }}
      />
    </View>
  </Card>
);

// ─── SECTION: Edit Profile ────────────────────────────────────────────────────

const EditSection = ({ user, theme, dispatch, token, role }) => {
  const [name,   setName]   = useState(user?.name  ?? '');
  const [phone,  setPhone]  = useState(stripPhone(user?.phone ?? ''));
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const validate = () => {
    const e = {};
    if (name.trim() && !isValidPersonName(name)) e.name  = 'Only letters and spaces allowed';
    if (phone && !isValidLocalPhone(phone))       e.phone = 'Phone must be exactly 9 digits';
    return e;
  };

  const handleSave = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setSaving(true);
    try {
      const { data } = await apiClient.patch('/profile/personal', {
        name:  name.trim()  || undefined,
        phone: phone        || undefined,
      });
      dispatch(loginSuccess({ user: { ...user, ...data.user }, token }));
      Alert.alert('Done ✓', 'Profile updated successfully.');
    } catch (err) {
      Alert.alert('Error', err?.response?.data?.message ?? 'Failed to update profile');
    } finally { setSaving(false); }
  };

  return (
    <View style={sh.group}>
      <Card style={sh.formCard}>
        <Lbl text={role === 'seller' ? 'Owner name' : 'Full name'} theme={theme} />
        <Fld
          value={name}
          onChange={(t) => { setName(t.replace(/[^A-Za-z\s]/g, '')); setErrors((p) => ({ ...p, name: '' })); }}
          placeholder="Your full name"
          theme={theme}
          autoCapitalize="words"
        />
        <ErrTxt msg={errors.name} />

        <Lbl text="Email address" theme={theme} />
        <Fld value={user?.email ?? ''} placeholder="Email" theme={theme} editable={false} />
        <Text style={[sh.hintTxt, { color: theme.colors.text.tertiary }]}>Email cannot be changed here.</Text>

        <Lbl text="Phone number" theme={theme} />
        <View style={sh.phoneRow}>
          <Text style={[sh.phonePrefix, { color: theme.colors.text.secondary }]}>🇱🇰 +94</Text>
          <Fld
            value={phone}
            onChange={(t) => { setPhone(t.replace(/\D/g, '').slice(0, 9)); setErrors((p) => ({ ...p, phone: '' })); }}
            placeholder="771234567"
            theme={theme}
            keyboardType="phone-pad"
            maxLength={9}
            autoCapitalize="none"
          />
        </View>
        <ErrTxt msg={errors.phone} />
        {phone.length === 9 && isValidLocalPhone(phone) && <OkTxt msg={`✓ +94${phone}`} />}

      </Card>
      <PrimaryBtn label="Save changes" onPress={handleSave} disabled={saving} theme={theme} />
    </View>
  );
};

// ─── SECTION: Change Password ─────────────────────────────────────────────────

const PasswordSection = ({ theme }) => {
  const [fields,  setFields]  = useState({ current: '', newPw: '', confirm: '' });
  const [errors,  setErrors]  = useState({});
  const [touched, setTouched] = useState({});
  const [saving,  setSaving]  = useState(false);
  const [visible, setVisible] = useState({ current: false, newPw: false, confirm: false });

  const strength  = useMemo(() => getPasswordStrength(fields.newPw), [fields.newPw]);
  const pwdErrors = useMemo(() => getPasswordErrors(fields.newPw),   [fields.newPw]);

  const update  = (key, val) => { setFields((p) => ({ ...p, [key]: val })); setErrors((p) => ({ ...p, [key]: '' })); };
  const touchFn = (key) => setTouched((p) => ({ ...p, [key]: true }));

  const validate = () => {
    const e = {};
    if (!fields.current)                 e.current = 'Current password is required';
    if (pwdErrors.length > 0)            e.newPw   = pwdErrors[0];
    if (fields.newPw !== fields.confirm) e.confirm = 'Passwords do not match';
    return e;
  };

  const handleSave = async () => {
    setTouched({ current: true, newPw: true, confirm: true });
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setSaving(true);
    try {
      await apiClient.patch('/profile/password', {
        currentPassword: fields.current,
        newPassword: fields.newPw,
      });
      Alert.alert('Done ✓', 'Password changed successfully.');
      setFields({ current: '', newPw: '', confirm: '' });
      setTouched({});
    } catch (err) {
      Alert.alert('Error', err?.response?.data?.message ?? 'Failed to change password');
    } finally { setSaving(false); }
  };

  const rows = [
    { key: 'current', label: 'Current password',  placeholder: 'Enter current password',   vis: 'current' },
    { key: 'newPw',   label: 'New password',       placeholder: 'At least 8 characters',    vis: 'newPw'   },
    { key: 'confirm', label: 'Confirm password',   placeholder: 'Repeat your new password', vis: 'confirm' },
  ];

  return (
    <View style={sh.group}>
      <Card style={sh.formCard}>
        {rows.map(({ key, label, placeholder, vis }) => (
          <View key={key}>
            <Lbl text={label} theme={theme} />
            <View style={sh.pwFieldWrap}>
              <TextInput
                style={[
                  sh.input, sh.pwInputFull,
                  { color: theme.colors.text.primary, borderColor: touched[key] && errors[key] ? '#ef4444' : theme.colors.border },
                ]}
                value={fields[key]}
                onChangeText={(t) => update(key, t)}
                onBlur={() => touchFn(key)}
                placeholder={placeholder}
                placeholderTextColor={theme.colors.text.tertiary}
                secureTextEntry={!visible[vis]}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setVisible((p) => ({ ...p, [vis]: !p[vis] }))} style={sh.eyeBtnInside}>
                <EyeIcon visible={visible[vis]} color={theme.colors.text.secondary} />
              </TouchableOpacity>
            </View>
            {key === 'newPw' && fields.newPw.length > 0 && (
              <View style={sh.strengthRow}>
                <View style={sh.strengthBg}>
                  <View style={[sh.strengthBar, { width: `${strength.score * 25}%`, backgroundColor: strength.color }]} />
                </View>
                <Text style={[sh.strengthTxt, { color: strength.color }]}>{strength.label}</Text>
              </View>
            )}
            {key === 'newPw' && touched.newPw && pwdErrors.length > 0 && pwdErrors.map((e) => <ErrTxt key={e} msg={`✕ ${e}`} />)}
            {key === 'newPw' && touched.newPw && pwdErrors.length === 0 && fields.newPw && <OkTxt msg="✓ Password looks great!" />}
            {key !== 'newPw' && <ErrTxt msg={touched[key] && errors[key] ? errors[key] : ''} />}
            {key === 'confirm' && fields.confirm && fields.newPw === fields.confirm && <OkTxt msg="✓ Passwords match" />}
          </View>
        ))}
      </Card>
      <PrimaryBtn label="Change password" onPress={handleSave} disabled={saving} theme={theme} />
    </View>
  );
};

// ─── SECTION: Delivery Address (buyer) ───────────────────────────────────────

const AddressSection = ({ user, theme, dispatch, token }) => {
  const [location, setLocation] = useState({
    address: user?.address ?? '',
    city: user?.city ?? '',
    lat: user?.lat ?? null,
    lng: user?.lng ?? null,
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
  if (!location.address.trim()) { Alert.alert('Required', 'Please select your delivery address.'); return; }
  setSaving(true);
  try {
    const { data } = await apiClient.patch('/profile/address', {
      address: location.address,
      city: location.city,
      latitude: location.lat,
      longitude: location.lng,
    });
    dispatch(loginSuccess({ user: { ...user, ...data.user }, token }));
    Alert.alert('Done ✓', 'Delivery address updated.');
  } catch (err) {
    Alert.alert('Error', err?.response?.data?.message ?? 'Failed to update address');
  } finally { setSaving(false); }
};

  return (
    <View style={sh.group}>
      <MapAddressPicker
        initialLat={location.lat}
        initialLng={location.lng}
        onChange={setLocation}
        theme={theme}
      />
      <PrimaryBtn label="Save address" onPress={handleSave} disabled={saving} theme={theme} />
    </View>
  );
};

// ─── SECTION: Payment Methods (buyer) ────────────────────────────────────────

const PaymentsSection = ({ theme }) => {
  const [payments,       setPayments]       = useState([{ label: 'Primary card', details: 'Visa •••• 4242' }]);
  const [paymentLabel,   setPaymentLabel]   = useState('');
  const [paymentDetails, setPaymentDetails] = useState('');
  const [showAddForm,    setShowAddForm]    = useState(false);
  const [saving,         setSaving]         = useState(false);

  const handleAdd = () => {
    if (!paymentLabel.trim() || !paymentDetails.trim()) {
      Alert.alert('Required', 'Please enter a label and details for the payment method.');
      return;
    }
    setPayments((prev) => [{ label: paymentLabel.trim(), details: paymentDetails.trim() }, ...prev]);
    setPaymentLabel('');
    setPaymentDetails('');
    setShowAddForm(false);
    Alert.alert('Done ✓', 'Payment method added.');
  };

  const handleRemove = (item) => {
    Alert.alert('Remove', `Remove "${item.label}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => setPayments((prev) => prev.filter((p) => p !== item)) },
    ]);
  };

  return (
    <View style={sh.group}>
      {payments.map((p, i) => (
        <Card key={`${p.label}-${i}`} style={sh.infoCard}>
          <View style={sh.cardRow}>
            <View style={{ flex: 1 }}>
              <Text style={[sh.cardTitle, { color: theme.colors.text.primary }]}>{p.label}</Text>
              <Text style={[sh.cardText, { color: theme.colors.text.secondary }]}>{p.details}</Text>
            </View>
            <TouchableOpacity onPress={() => handleRemove(p)}>
              <Text style={sh.deleteTxt}>Remove</Text>
            </TouchableOpacity>
          </View>
        </Card>
      ))}

      {showAddForm ? (
        <Card style={sh.formCard}>
          <Lbl text="Payment label" theme={theme} />
          <Fld value={paymentLabel} onChange={setPaymentLabel} placeholder="e.g. Business card" theme={theme} />
          <Lbl text="Card details" theme={theme} />
          <Fld value={paymentDetails} onChange={setPaymentDetails} placeholder="e.g. Mastercard •••• 2020" theme={theme} />
          <PrimaryBtn label="Save payment method" onPress={handleAdd} disabled={saving} theme={theme} />
        </Card>
      ) : (
        <OutlineBtn label="Add payment method" onPress={() => setShowAddForm(true)} theme={theme} />
      )}
    </View>
  );
};
// ─── SECTION: Wishlist (buyer) ────────────────────────────────────────────────

const WishlistSection = ({ theme }) => {
  const [items, setItems] = useState([
    { id: 'wl-1', name: 'Organic Apples',  details: 'Fresh farm produce · $3.99' },
    { id: 'wl-2', name: 'Coconut Water',   details: 'Cold pressed · $2.50'       },
  ]);

  const handleRemove = (id) => setItems((prev) => prev.filter((i) => i.id !== id));

  if (!items.length) return (
    <Card style={sh.emptyCard}>
      <Text style={{ fontSize: 36, textAlign: 'center' }}>❤️</Text>
      <Text style={{ color: '#94a3b8', textAlign: 'center', marginTop: 8 }}>Your wishlist is empty.</Text>
    </Card>
  );

  return (
    <View style={sh.group}>
      {items.map((item) => (
        <Card key={item.id} style={sh.infoCard}>
          <View style={sh.cardRow}>
            <View style={{ flex: 1 }}>
              <Text style={[sh.cardTitle, { color: theme.colors.text.primary }]}>{item.name}</Text>
              <Text style={[sh.cardText, { color: theme.colors.text.secondary }]}>{item.details}</Text>
            </View>
            <TouchableOpacity onPress={() => handleRemove(item.id)}>
              <Text style={sh.deleteTxt}>Remove</Text>
            </TouchableOpacity>
          </View>
        </Card>
      ))}
    </View>
  );
};

// ─── SECTION: Business Info (seller) ─────────────────────────────────────────

const BusinessSection = ({ user, theme, dispatch, token }) => {
  const [location, setLocation] = useState({
    address: user?.businessAddress ?? '',
    city: user?.city ?? '',
    lat: user?.businessLat ?? null,
    lng: user?.businessLng ?? null,
  });
  const [bizName, setBizName] = useState(user?.businessName ?? '');
  const [saving,  setSaving]  = useState(false);

  const [products,        setProducts]        = useState([]);
  const [productsLoading, setProductsLoading]  = useState(true);
  const [statsData,       setStatsData]       = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await apiClient.get('/profile/products');
        setProducts(data.products ?? []);
      } catch { /* show empty */ } finally { setProductsLoading(false); }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await apiClient.get('/profile/stats');
        setStatsData(data.stats ?? null);
      } catch { /* show fallback */ }
    })();
  }, []);

  const handleSave = async () => {
    if (!bizName.trim())            { Alert.alert('Required', 'Business name is required.');    return; }
    if (!location.address.trim())   { Alert.alert('Required', 'Business address is required.'); return; }
    setSaving(true);
    try {
      const { data } = await apiClient.patch('/profile/business', {
        businessName:    bizName.trim(),
        businessAddress: location.address,
        city:            location.city,
        latitude:        location.lat,
        longitude:       location.lng,
      });
      dispatch(loginSuccess({ user: { ...user, ...data.user }, token }));
      Alert.alert('Done ✓', 'Business info updated.');
    } catch (err) {
      Alert.alert('Error', err?.response?.data?.message ?? 'Failed to update business info');
    } finally { setSaving(false); }
  };

  const productStatusStyle = (status) => status === 'PENDING_APPROVAL'
    ? { color: '#f59e0b', label: 'Pending' }
    : { color: '#10b981', label: 'Approved' };

  return (
    <View style={sh.group}>
      <Card style={sh.formCard}>
        <Lbl text="Business name" theme={theme} />
        <Fld value={bizName} onChange={setBizName} placeholder="Your business name" theme={theme} />
      </Card>

      <MapAddressPicker
        initialLat={location.lat}
        initialLng={location.lng}
        onChange={setLocation}
        theme={theme}
      />

      <PrimaryBtn label="Save business info" onPress={handleSave} disabled={saving} theme={theme} />

      {/* Your Products */}
      <View>
        <Text style={[sh.sectionLabel, { color: theme.colors.text.primary }]}>Your Products</Text>
        {productsLoading ? (
          <View style={sh.centered}><ActivityIndicator color="#10b981" /></View>
        ) : products.length === 0 ? (
          <Card style={sh.emptyCard}>
            <Text style={{ color: '#94a3b8', textAlign: 'center' }}>No products listed yet.</Text>
          </Card>
        ) : (
          products.map((p) => {
            const st = productStatusStyle(p.status);
            return (
              <Card key={p.name} style={sh.infoCard}>
                <View style={sh.cardRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={[sh.cardTitle, { color: theme.colors.text.primary }]}>{p.name}</Text>
                    <Text style={[sh.cardText, { color: theme.colors.text.secondary }]}>{p.price}</Text>
                  </View>
                  <View style={[sh.statusPill, { borderColor: `${st.color}40`, backgroundColor: `${st.color}20` }]}>
                    <Text style={{ color: st.color, fontSize: 12, fontWeight: '600' }}>{st.label}</Text>
                  </View>
                </View>
              </Card>
            );
          })
        )}
      </View>

      {/* Earnings Summary */}
      <Card style={sh.formCard}>
        <Text style={[sh.cardTitle, { color: theme.colors.text.primary, marginBottom: 8 }]}>Earnings Summary</Text>
        <View style={sh.earningsGrid}>
          {[
            { label: 'This month',     value: statsData?.thisMonth     ?? '—' },
            { label: 'Last month',     value: statsData?.lastMonth     ?? '—' },
            { label: 'Total orders',   value: statsData?.totalOrders != null ? String(statsData.totalOrders) : '—' },
            { label: 'Pending payout', value: statsData?.pendingPayout ?? '—' },
          ].map((e) => (
            <View key={e.label} style={sh.earningsCell}>
              <Text style={[sh.earningsValue, { color: theme.colors.text.primary }]}>{e.value}</Text>
              <Text style={[sh.earningsLabel, { color: theme.colors.text.secondary }]}>{e.label}</Text>
            </View>
          ))}
        </View>
      </Card>
    </View>
  );
};

// ─── SECTION: Vehicle Info (driver) ──────────────────────────────────────────

const VehicleSection = ({ user, theme }) => {
  const [vehicleType,  setVehicleType]  = useState(user?.vehicleType  ?? '');
  const [plateNumber,  setPlateNumber]  = useState(user?.plateNumber  ?? '');
  const [vehicleModel, setVehicleModel] = useState(user?.vehicleModel ?? '');
  const [saving,       setSaving]       = useState(false);

  const handleSave = async () => {
    if (!plateNumber.trim()) { Alert.alert('Required', 'Plate number is required.'); return; }
    setSaving(true);
    try {
      await apiClient.patch('/profile/vehicle', {
        vehicleType:  vehicleType.trim()  || undefined,
        plateNumber:  plateNumber.trim(),
        vehicleModel: vehicleModel.trim() || undefined,
      });
      Alert.alert('Done ✓', 'Vehicle info updated.');
    } catch (err) {
      Alert.alert('Error', err?.response?.data?.message ?? 'Failed to update vehicle info');
    } finally { setSaving(false); }
  };

  return (
    <View style={sh.group}>
      <Card style={sh.formCard}>
        <Lbl text="Vehicle type"  theme={theme} />
        <Fld value={vehicleType}  onChange={setVehicleType}  placeholder="e.g. Motorbike, Van" theme={theme} />
        <Lbl text="Plate number"  theme={theme} />
        <Fld value={plateNumber}  onChange={setPlateNumber}  placeholder="e.g. CAB-1234"       theme={theme} autoCapitalize="characters" />
        <Lbl text="Vehicle model" theme={theme} />
        <Fld value={vehicleModel} onChange={setVehicleModel} placeholder="e.g. Honda CB150"   theme={theme} />
      </Card>
      <PrimaryBtn label="Save vehicle info" onPress={handleSave} disabled={saving} theme={theme} />
    </View>
  );
};

// ─── SECTION: Availability (driver) ──────────────────────────────────────────

const AvailabilitySection = ({ theme }) => {
  const [isAvailable, setIsAvailable] = useState(true);
  const [mon, setMon] = useState(true);
  const [tue, setTue] = useState(true);
  const [wed, setWed] = useState(true);
  const [thu, setThu] = useState(true);
  const [fri, setFri] = useState(true);
  const [sat, setSat] = useState(false);
  const [sun, setSun] = useState(false);

  const days = [
    { label: 'Monday',    value: mon, set: setMon },
    { label: 'Tuesday',   value: tue, set: setTue },
    { label: 'Wednesday', value: wed, set: setWed },
    { label: 'Thursday',  value: thu, set: setThu },
    { label: 'Friday',    value: fri, set: setFri },
    { label: 'Saturday',  value: sat, set: setSat },
    { label: 'Sunday',    value: sun, set: setSun },
  ];

  return (
    <View style={sh.group}>
      <ToggleRow
        label="Available for deliveries"
        sub="Turn off to go offline"
        value={isAvailable}
        onChange={() => setIsAvailable((p) => !p)}
        theme={theme}
      />
      <Card style={sh.formCard}>
        <Text style={[sh.cardTitle, { color: theme.colors.text.primary, marginBottom: 8 }]}>Active days</Text>
        {days.map((d) => (
          <View key={d.label} style={[sh.toggleRow, { marginBottom: 8 }]}>
            <Text style={[sh.toggleTitle, { color: theme.colors.text.primary, flex: 1 }]}>{d.label}</Text>
            <Switch
              value={d.value}
              onValueChange={d.set}
              thumbColor="#fff"
              trackColor={{ false: theme.colors.border, true: theme.colors.primary.main }}
            />
          </View>
        ))}
      </Card>
    </View>
  );
};

// ─── SECTION: Reviews ─────────────────────────────────────────────────────────

const ReviewsSection = ({ role, theme }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editId,  setEditId]  = useState(null);
  const [draft,   setDraft]   = useState({ rating: 5, comment: '' });

  useEffect(() => {
    (async () => {
      try {
        if (role === 'buyer') {
          const { data } = await apiClient.get('/rating/my');
          setReviews(data);
        } else {
          const { data } = await apiClient.get('/rating/my-seller-ratings');
          setReviews(data.ratings ?? []);
        }
      } catch { /* show empty */ } finally { setLoading(false); }
    })();
  }, [role]);

  const handleDelete = async (id) => {
    try {
      await apiClient.delete(`/rating/${id}`);
      setReviews((p) => p.filter((r) => r.id !== id));
      Alert.alert('Done ✓', 'Review deleted.');
    } catch (err) {
      Alert.alert('Error', err?.response?.data?.message ?? 'Failed to delete');
    }
  };

  const handleSaveEdit = async (id) => {
    try {
      await apiClient.patch(`/rating/${id}`, { ratings: { overall: draft.rating }, comment: draft.comment });
      setReviews((p) => p.map((r) => r.id === id ? { ...r, rating: draft.rating, comment: draft.comment } : r));
      setEditId(null);
      Alert.alert('Done ✓', 'Review updated.');
    } catch (err) {
      Alert.alert('Error', err?.response?.data?.message ?? 'Failed to update');
    }
  };

  const handleFlag = async (id) => {
    try {
      await apiClient.post(`/rating/${id}/flag`);
      setReviews((p) => p.map((r) => r.id === id ? { ...r, isFlagged: true } : r));
    } catch {
      Alert.alert('Error', 'Failed to flag review');
    }
  };

  if (loading) return <View style={sh.centered}><ActivityIndicator color="#10b981" /></View>;

  if (!reviews.length) return (
    <Card style={sh.emptyCard}>
      <Text style={{ fontSize: 36, textAlign: 'center' }}>⭐</Text>
      <Text style={{ color: '#94a3b8', textAlign: 'center', marginTop: 8 }}>No reviews yet.</Text>
    </Card>
  );

  return (
    <View style={sh.group}>
      {reviews.map((r) => {
        const canEdit = role === 'buyer' && (Date.now() - new Date(r.createdAt).getTime()) / 3600000 <= 24;
        return (
          <Card key={r.id} style={{ marginBottom: 4 }}>
            <View style={sh.reviewHeader}>
              <View style={{ flex: 1 }}>
                <Text style={sh.reviewProduct}>{r.product?.name ?? r.productName ?? 'Product'}</Text>
                {r.order?.orderNumber && <Text style={sh.reviewMeta}>#{r.order.orderNumber}</Text>}
                {role === 'seller' && r.buyer?.user?.name && <Text style={sh.reviewMeta}>by {r.buyer.user.name}</Text>}
              </View>
              <View style={{ alignItems: 'flex-end', gap: 4 }}>
                {canEdit && editId !== r.id && (
                  <TouchableOpacity onPress={() => { setEditId(r.id); setDraft({ rating: r.rating, comment: r.comment ?? '' }); }}>
                    <Text style={sh.editTxt}>✏ Edit</Text>
                  </TouchableOpacity>
                )}
                {canEdit && <TouchableOpacity onPress={() => handleDelete(r.id)}><Text style={sh.deleteTxt}>✕ Delete</Text></TouchableOpacity>}
                {role === 'seller' && !r.isFlagged && <TouchableOpacity onPress={() => handleFlag(r.id)}><Text style={sh.flagTxt}>⚑ Flag</Text></TouchableOpacity>}
                {r.isFlagged && <Text style={sh.flaggedTxt}>⚑ Flagged</Text>}
              </View>
            </View>
            {editId === r.id ? (
              <View style={{ marginTop: 10, gap: 8 }}>
                <View style={sh.starRow}>
                  {[1,2,3,4,5].map((s) => (
                    <TouchableOpacity key={s} onPress={() => setDraft((p) => ({ ...p, rating: s }))}>
                      <Text style={[sh.starTxt, draft.rating >= s && sh.starActive]}>★</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <TextInput
                  style={[sh.input, { color: '#f1f5f9', borderColor: '#334155', height: 70, textAlignVertical: 'top' }]}
                  value={draft.comment}
                  onChangeText={(t) => setDraft((p) => ({ ...p, comment: t }))}
                  placeholder="Update your comment"
                  placeholderTextColor="#64748b"
                  multiline
                />
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <TouchableOpacity style={[sh.smallBtn, { borderColor: '#10b981' }]} onPress={() => handleSaveEdit(r.id)}>
                    <Text style={{ color: '#10b981', fontSize: 13, fontWeight: '600' }}>Save</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[sh.smallBtn, { borderColor: '#475569' }]} onPress={() => setEditId(null)}>
                    <Text style={{ color: '#94a3b8', fontSize: 13 }}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={{ marginTop: 8 }}>
                <Text style={{ color: '#fbbf24', fontSize: 16 }}>{renderStars(r.rating)}</Text>
                {r.comment ? <Text style={sh.reviewComment}>"{r.comment}"</Text> : null}
              </View>
            )}
          </Card>
        );
      })}
    </View>
  );
};

// ─── SECTION: Notifications ───────────────────────────────────────────────────

const NotificationsSection = ({ theme, role }) => {
  const [orderUpdates, setOrderUpdates] = useState(true);
  const [promotions,   setPromotions]   = useState(false);
  const [payouts,      setPayouts]      = useState(true);
  const [newRoutes,    setNewRoutes]    = useState(true);
  const [stock,        setStock]        = useState(true);

  const toggles =
    role === 'buyer' ? [
      { label: 'Order updates',     sub: 'Delivery and pickup alerts',      val: orderUpdates, set: () => setOrderUpdates((p) => !p) },
      { label: 'Promotions',        sub: 'Deals and offers from sellers',   val: promotions,   set: () => setPromotions((p) => !p)   },
      { label: 'Low stock alerts',  sub: 'When your favourite items run low', val: stock,      set: () => setStock((p) => !p)        },
    ] :
    role === 'seller' ? [
      { label: 'New orders',        sub: 'When a customer places an order', val: orderUpdates, set: () => setOrderUpdates((p) => !p) },
      { label: 'Payout alerts',     sub: 'When earnings are transferred',   val: payouts,      set: () => setPayouts((p) => !p)      },
      { label: 'Low stock alerts',  sub: 'When your product stock runs low',val: stock,   set: () => setStock((p) => !p)        },
    ] : /* driver */ [
      { label: 'New delivery jobs', sub: 'Available routes near you',       val: newRoutes,    set: () => setNewRoutes((p) => !p)    },
      { label: 'Order updates',     sub: 'Status changes on active orders', val: orderUpdates, set: () => setOrderUpdates((p) => !p) },
    ];

  return (
    <View style={sh.group}>
      {toggles.map((t) => (
        <ToggleRow key={t.label} label={t.label} sub={t.sub} value={t.val} onChange={t.set} theme={theme} />
      ))}
    </View>
  );
};

// ─── SECTION: Help ────────────────────────────────────────────────────────────

const HelpSection = ({ theme }) => {
  const openEmail = async () => {
    const url = 'mailto:support@freshroute.lk?subject=Support%20Request';
    const ok  = await Linking.canOpenURL(url);
    if (ok) await Linking.openURL(url);
    else Alert.alert('Support', 'Email us at support@freshroute.lk');
  };
  return (
    <View style={sh.group}>
      <Card>
        <Text style={[sh.cardTitle, { color: theme.colors.text.primary }]}>Need help?</Text>
        <Text style={[sh.cardText, { color: theme.colors.text.secondary, marginTop: 4 }]}>
          Our support team is available Mon–Fri, 9am–6pm.{'\n'}support@freshroute.lk
        </Text>
      </Card>
      <OutlineBtn label="Contact support" onPress={openEmail} theme={theme} />
    </View>
  );
};

// ─── SECTION: Terms & Privacy ─────────────────────────────────────────────────

const TermsSection = ({ theme, role }) => {
  const [visible,     setVisible]     = useState(true);
  const [dataSharing, setDataSharing] = useState(false);

  const privacyToggles = [
    role === 'buyer'
      ? { label: 'Profile visibility', sub: 'Allow vendors to see your profile',  val: visible, set: () => setVisible((p) => !p) }
      : { label: 'Store visibility',   sub: 'Allow customers to find your store', val: visible, set: () => setVisible((p) => !p) },
    { label: 'Share data for recommendations', sub: 'Help us improve your experience', val: dataSharing, set: () => setDataSharing((p) => !p) },
  ];

  return (
    <View style={sh.group}>
      {(role === 'buyer' || role === 'seller') && privacyToggles.map((t) => (
        <ToggleRow key={t.label} label={t.label} sub={t.sub} value={t.val} onChange={t.set} theme={theme} />
      ))}

      {[
        { title: 'Privacy & terms',  body: 'Your data is protected and used only to improve your FreshRoute experience.' },
        { title: 'Data use',         body: 'We use your profile details to personalize products, delivery, and support — and never share them without your consent.' },
        { title: 'Account rights',   body: 'You can edit your information, change your password, and request account deletion at any time from this profile section.' },
      ].map((item) => (
        <Card key={item.title} style={sh.infoCard}>
          <Text style={[sh.cardTitle, { color: theme.colors.text.primary }]}>{item.title}</Text>
          <Text style={[sh.cardText, { color: theme.colors.text.secondary, marginTop: 4 }]}>{item.body}</Text>
        </Card>
      ))}
    </View>
  );
};

// ─── SECTION: Danger Zone ─────────────────────────────────────────────────────

const DangerZoneSection = ({ role, dispatch, theme }) => {
  const [confirming, setConfirming] = useState(false);
  const [deleting,   setDeleting]   = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await apiClient.delete('/profile');
      Alert.alert('Account deleted', 'Your account has been permanently removed.');
      dispatch(logout());
    } catch (err) {
      Alert.alert('Error', err?.response?.data?.message ?? 'Failed to delete account');
      setDeleting(false);
    }
  };

  return (
    <View style={sh.group}>
      <Card style={sh.dangerCard}>
        <Text style={sh.dangerTitle}>Danger Zone</Text>
        <Text style={[sh.cardText, { color: theme.colors.text.secondary, marginTop: 4, marginBottom: 12 }]}>
          Once deleted, your account and all data will be permanently removed. This cannot be undone.
        </Text>

        {!confirming ? (
          <TouchableOpacity style={sh.dangerBtn} onPress={() => setConfirming(true)} activeOpacity={0.8}>
            <Text style={sh.dangerBtnTxt}>{role === 'seller' ? 'Delete My Store' : 'Delete My Account'}</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ gap: 8 }}>
            <Text style={sh.dangerConfirmTxt}>Are you sure? This cannot be undone.</Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TouchableOpacity
                style={[sh.dangerBtn, { flex: 1 }, deleting && { opacity: 0.6 }]}
                onPress={handleDelete}
                disabled={deleting}
                activeOpacity={0.8}
              >
                {deleting
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={sh.dangerBtnTxt}>Yes, delete it</Text>
                }
              </TouchableOpacity>
              <TouchableOpacity
                style={[sh.outlineBtn, { flex: 1 }]}
                onPress={() => setConfirming(false)}
                disabled={deleting}
                activeOpacity={0.7}
              >
                <Text style={[sh.outlineBtnTxt, { color: theme.colors.text.primary }]}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </Card>
    </View>
  );
};

// ─── Detail view ──────────────────────────────────────────────────────────────

const DetailView = ({ section, user, theme, dispatch, token, role, onBack }) => {
  const renderContent = () => {
    switch (section.id) {
      case 'edit':          return <EditSection         user={user} theme={theme} dispatch={dispatch} token={token} role={role} />;
      case 'password':      return <PasswordSection     theme={theme} />;
      case 'address':       return <AddressSection      user={user} theme={theme} dispatch={dispatch} token={token} />;
      case 'payments':      return <PaymentsSection     theme={theme} />;
      case 'wishlist':      return <WishlistSection     theme={theme} />;
      case 'business':      return <BusinessSection     user={user} theme={theme} dispatch={dispatch} token={token} />;
      case 'vehicle':       return <VehicleSection      user={user} theme={theme} />;
      case 'availability':  return <AvailabilitySection theme={theme} />;
      case 'reviews':       return <ReviewsSection      role={role} theme={theme} />;
      case 'notifications': return <NotificationsSection theme={theme} role={role} />;
      case 'help':          return <HelpSection         theme={theme} />;
      case 'terms':         return <TermsSection        theme={theme} role={role} />;
      case 'danger':        return <DangerZoneSection    role={role} dispatch={dispatch} theme={theme} />;
      default:              return null;
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <TouchableOpacity onPress={onBack} style={ms.backBtn} activeOpacity={0.7}>
        <Text style={[ms.backArrow, { color: theme.colors.text.primary }]}>←</Text>
        <Text style={[ms.backLabel, { color: theme.colors.text.secondary }]}>Back to Profile</Text>
      </TouchableOpacity>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={ms.detailScroll}>
        <Card style={ms.heroCard}>
          <View style={[ms.iconBadge, { backgroundColor: `${theme.colors.primary.main}20` }]}>
            <Text style={{ fontSize: 28 }}>{section.icon}</Text>
          </View>
          <Text style={[ms.heroTitle, { color: theme.colors.text.primary }]}>{section.title}</Text>
          <Text style={[ms.heroSub,   { color: theme.colors.text.secondary }]}>{section.desc}</Text>
        </Card>
        {renderContent()}
      </ScrollView>
    </View>
  );
};

// ─── Main ProfileScreen ───────────────────────────────────────────────────────

const ProfileScreen = () => {
  const { theme, isDarkMode, toggleTheme } = useTheme();
  const dispatch = useDispatch();
  const { user, token } = useSelector((st) => st.auth);

  const [activeSection, setActiveSection] = useState(null);

  const role      = user?.role?.toLowerCase() ?? 'buyer';
  const menuItems = getMenuItems(role);
  const badge     = getRoleBadge(role);

  const displayName  = user?.name  || 'User';
  const displayEmail = user?.email || '';
  const displayPhone = formatPhoneDisplay(user?.phone ?? '');

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: () => dispatch(logout()) },
    ]);
  };

  // ── Detail view ──
  if (activeSection) {
    return (
      <View style={[ms.container, { backgroundColor: theme.colors.background }]}>
        <DetailView
          section={activeSection}
          user={user}
          theme={theme}
          dispatch={dispatch}
          token={token}
          role={role}
          onBack={() => setActiveSection(null)}
        />
      </View>
    );
  }

  // ── Menu (home) view ──
  return (
    <View style={[ms.container, { backgroundColor: theme.colors.background }]}>
      <View style={ms.header}>
        <Text style={[ms.headerTitle, { color: theme.colors.text.primary }]}>Profile</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={ms.scrollContent}>

        {/* User card */}
        <Card style={ms.userCard}>
          <Avatar name={displayName} size="large" />
          <View style={[ms.rolePill, { backgroundColor: `${badge.color}20`, borderColor: `${badge.color}40` }]}>
            <Text style={[ms.roleText, { color: badge.color }]}>{badge.label}</Text>
          </View>
          <Text style={[ms.userName,  { color: theme.colors.text.primary }]}>{displayName}</Text>
          <Text style={[ms.userEmail, { color: theme.colors.text.secondary }]}>{displayEmail}</Text>
          {displayPhone ? <Text style={[ms.userPhone, { color: theme.colors.text.tertiary }]}>{displayPhone}</Text> : null}
        </Card>

        {/* Theme toggle */}
        <Card style={ms.themeCard}>
          <View style={ms.themeRow}>
            <View style={ms.themeInfo}>
              <Text style={{ fontSize: 28, marginRight: 16 }}>{isDarkMode ? '🌙' : '☀️'}</Text>
              <View>
                <Text style={[ms.themeTitle, { color: theme.colors.text.primary }]}>{isDarkMode ? 'Dark Mode' : 'Light Mode'}</Text>
                <Text style={[ms.themeSub,   { color: theme.colors.text.secondary }]}>Toggle app appearance</Text>
              </View>
            </View>
            <Switch
              value={isDarkMode}
              onValueChange={toggleTheme}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary.main }}
              thumbColor="#fff"
            />
          </View>
        </Card>

        {/* Menu items */}
        <View style={ms.menuSection}>
          {menuItems.map((item) => (
            <TouchableOpacity key={item.id} onPress={() => setActiveSection(item)} activeOpacity={0.7}>
              <Card style={ms.menuItem}>
                <View style={ms.menuItemContent}>
                  <View style={[ms.menuIconBox, { backgroundColor: `${theme.colors.primary.main}15` }]}>
                    <Text style={{ fontSize: 20 }}>{item.icon}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[ms.menuTitle, { color: theme.colors.text.primary }]}>{item.title}</Text>
                    <Text style={[ms.menuSub,   { color: theme.colors.text.secondary }]}>{item.desc}</Text>
                  </View>
                </View>
                <Text style={{ fontSize: 20, color: theme.colors.text.tertiary }}>→</Text>
              </Card>
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout */}
        <TouchableOpacity
          style={[ms.logoutBtn, { backgroundColor: theme.colors.error }]}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Text style={ms.logoutTxt}>Logout</Text>
        </TouchableOpacity>

        <Text style={[ms.version, { color: theme.colors.text.tertiary }]}>FreshRoute v1.0.0</Text>
      </ScrollView>
    </View>
  );
};

// ─── Shared styles (sections) ─────────────────────────────────────────────────

const sh = StyleSheet.create({
  group:    { gap: 12 },
  formCard: { gap: 10 },
  infoCard: { gap: 4 },
  label:    { fontSize: 13, fontWeight: '600', marginBottom: 2 },
  hintTxt:  { fontSize: 11, marginTop: 2 },
  input:    { borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14 },
  errTxt:   { color: '#f87171', fontSize: 12, marginTop: 2 },
  okTxt:    { color: '#10b981', fontSize: 12, marginTop: 2 },

  phoneRow:    { flexDirection: 'row', alignItems: 'center', gap: 8 },
  phonePrefix: { fontSize: 14, fontWeight: '600', paddingHorizontal: 6 },

  pwFieldWrap:  { position: 'relative', justifyContent: 'center' },
  pwInputFull:  { paddingRight: 44 },
  eyeBtnInside: { position: 'absolute', right: 12, padding: 4 },
  strengthRow:  { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4, marginBottom: 2 },
  strengthBg:   { flex: 1, height: 6, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.1)', overflow: 'hidden' },
  strengthBar:  { height: 6, borderRadius: 999 },
  strengthTxt:  { fontSize: 12, fontWeight: '600' },

  primaryBtn:    { borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginTop: 8 },
  primaryBtnTxt: { color: '#fff', fontSize: 15, fontWeight: '700' },
  outlineBtn:    { borderWidth: 1, borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  outlineBtnTxt: { fontSize: 15, fontWeight: '600' },

  cardRow:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 },
  cardTitle: { fontSize: 15, fontWeight: '600' },
  cardText:  { fontSize: 14 },
  deleteTxt: { color: '#ef4444', fontSize: 13, fontWeight: '600' },

  toggleCard:  { paddingVertical: 14 },
  toggleRow:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  toggleTitle: { fontSize: 15, fontWeight: '600' },
  toggleSub:   { fontSize: 12, marginTop: 2 },

  dangerCard:      { borderColor: 'rgba(239,68,68,0.3)', borderWidth: 1, backgroundColor: 'rgba(239,68,68,0.05)' },
  dangerTitle:     { fontSize: 15, fontWeight: '700', color: '#ef4444' },
  dangerBtn:       { borderWidth: 1, borderColor: 'rgba(239,68,68,0.4)', backgroundColor: 'rgba(239,68,68,0.1)', borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  dangerBtnTxt:    { color: '#ef4444', fontSize: 14, fontWeight: '700' },
  dangerConfirmTxt:{ color: '#fca5a5', fontSize: 13, fontWeight: '600' },

  reviewHeader:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  reviewProduct: { fontSize: 15, fontWeight: '600', color: '#f1f5f9' },
  reviewMeta:    { fontSize: 11, color: '#64748b', fontFamily: 'monospace' },
  reviewComment: { fontSize: 13, color: '#cbd5e1', marginTop: 4, fontStyle: 'italic' },
  editTxt:       { color: '#10b981', fontSize: 12, fontWeight: '600' },
  flagTxt:       { color: '#94a3b8', fontSize: 12 },
  flaggedTxt:    { color: '#f59e0b', fontSize: 12 },
  starRow:       { flexDirection: 'row', gap: 4 },
  starTxt:       { fontSize: 22, color: '#475569' },
  starActive:    { color: '#fbbf24' },
  smallBtn:      { flex: 1, borderWidth: 1, borderRadius: 10, paddingVertical: 8, alignItems: 'center' },

  emptyCard: { alignItems: 'center', paddingVertical: 32 },

  sectionLabel: { fontSize: 15, fontWeight: '600', marginBottom: 8, marginTop: 4 },
  statusPill:   { borderWidth: 1, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  earningsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  earningsCell: { width: '47%', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', borderRadius: 12, padding: 10, alignItems: 'center' },
  earningsValue:{ fontSize: 15, fontWeight: '700' },
  earningsLabel:{ fontSize: 11, marginTop: 2 },
  centered:  { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 40 },
});

// ─── Main screen styles ───────────────────────────────────────────────────────

const ms = StyleSheet.create({
  container:    { flex: 1 },
  header:       { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16 },
  headerTitle:  { fontSize: 28, fontWeight: '700' },
  scrollContent:{ paddingBottom: 120 },

  userCard:  { alignItems: 'center', marginHorizontal: 20, marginBottom: 16, padding: 24 },
  rolePill:  { marginTop: 12, marginBottom: 4, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, borderWidth: 1 },
  roleText:  { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  userName:  { fontSize: 22, fontWeight: '700', marginTop: 8, marginBottom: 4 },
  userEmail: { fontSize: 14, marginBottom: 2 },
  userPhone: { fontSize: 13 },

  themeCard:  { marginHorizontal: 20, marginBottom: 16 },
  themeRow:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  themeInfo:  { flexDirection: 'row', alignItems: 'center', flex: 1 },
  themeTitle: { fontSize: 16, fontWeight: '600', marginBottom: 2 },
  themeSub:   { fontSize: 13 },

  menuSection:     { marginHorizontal: 20, marginBottom: 16 },
  menuItem:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, padding: 16 },
  menuItemContent: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  menuIconBox:     { width: 42, height: 42, borderRadius: 21, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  menuTitle:       { fontSize: 15, fontWeight: '600' },
  menuSub:         { fontSize: 12, marginTop: 2 },

  logoutBtn: { marginHorizontal: 20, marginTop: 8, padding: 16, borderRadius: 12, alignItems: 'center' },
  logoutTxt: { color: '#fff', fontSize: 16, fontWeight: '600' },
  version:   { textAlign: 'center', fontSize: 12, marginVertical: 24 },

  backBtn:     { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 12, gap: 8 },
  backArrow:   { fontSize: 22, fontWeight: '700' },
  backLabel:   { fontSize: 14 },
  detailScroll:{ paddingHorizontal: 20, paddingBottom: 60 },
  heroCard:    { alignItems: 'center', marginBottom: 16 },
  iconBadge:   { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  heroTitle:   { fontSize: 18, fontWeight: '700' },
  heroSub:     { fontSize: 13, textAlign: 'center', marginTop: 4 },
});

export default ProfileScreen;