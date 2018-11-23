## 证书


#### 安装
certbot certonly --manual --preferred-challenges dns --server https://acme-v02.api.letsencrypt.org/directory

#### 更新

```
letsencrypt renew

```

#### 查看

```
letsencrypt certificates
``
